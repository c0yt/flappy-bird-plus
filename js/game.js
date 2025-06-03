// js/game.js

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        this.gameState = GAME_STATE.MENU;
        this.currentDifficultySettings = null;
        this.bird = null;
        this.pipes = [];
        this.coins = [];  // 保留金币数组
        this.powerUps = [];
        
        // 检测设备性能
        this.isLowEndDevice = this.detectLowEndDevice();
        
        // 在设置完基本属性后再创建UI实例
        this.ui = new UI(this);

        this.score = 0;
        this.highScore = localStorage.getItem("pixelBirdHighScore") || 0;

        this.pipeSpawnTimer = 0;
        this.nextPipeSpawnInterval = 0;

        this.isMagnetActive = false;
        this.magnetEndTime = 0;
        this.isDoubleScoreActive = false;
        this.doubleScoreEndTime = 0;
        this.currentSpeedMultiplier = 1.0; // For shield speed boost
        
        // 添加烟雾效果相关属性
        this.isSmokeActive = false;
        this.smokeEndTime = 0;
        this.smokeOverlayImage = new Image();
        this.smokeOverlayImage.src = ASSETS.smokeOverlay;

        this.lastTime = performance.now();
        this.animationFrameId = null;
        this.isRunning = false; // 添加这行来跟踪游戏是否正在运行

        this.images = {}; // 添加图片存储对象

        this.helpImage = new Image();
        this.helpImage.src = ASSETS.tapToStart;
        this.isWaitingForStart = false; // 初始化时不显示
        
        // 预加载ready图片
        this.readyImage = new Image();
        this.readyImage.src = ASSETS.ready;
        
        // 预加载start图片
        this.startImage = new Image();
        this.startImage.src = ASSETS.start;

        this.loadAssets();
        this.ui.showStartScreen();
        // No game loop starts until difficulty is selected and game starts
        this.crashSound = new Audio(ASSETS.crash);
        this.crashSound.volume = 0.6;
    }

    loadAssets() {
        this.backgroundImage = new Image();
        this.backgroundImage.src = ASSETS.background;

        // 添加加载完成回调
        this.backgroundImage.onload = () => console.log("Background loaded");
        this.backgroundImage.onerror = () => console.error("Failed to load background");

        // 添加加载错误处理
        const handleImageError = (imageName) => {
            console.error(`Failed to load image: ${imageName}`);
        };

        // 加载数字图片
        for (let i = 0; i < 10; i++) {
            const key = `n${i}`;
            this.images[key] = new Image();
            this.images[key].onerror = () => handleImageError(key);
            this.images[key].onload = () => console.log(`Successfully loaded: ${key}`);
            this.images[key].src = ASSETS[key];
        }

        // 加载帮助图片
        this.helpImage = new Image();
        this.helpImage.src = ASSETS.tapToStart;
        this.helpImage.onload = () => console.log("Help image loaded");
        this.helpImage.onerror = () => console.error("Failed to load help image");
    }

    setDifficulty(difficultyKey) {
        this.currentDifficultySettings = {...DIFFICULTIES[difficultyKey]};
        if (!this.currentDifficultySettings) {
            console.error("Invalid difficulty key:", difficultyKey);
            this.currentDifficultySettings = {...DIFFICULTIES.normal}; // 使用深拷贝
        }
        console.log("Difficulty set to:", difficultyKey, this.currentDifficultySettings);
    }
    
    // 在startGame方法中设置isWaitingForStart为true
    startGame() {
        if (!this.currentDifficultySettings) {
            console.error("No difficulty settings found!");
            alert("请先选择难度再开始游戏!");
            this.ui.showStartScreen();
            return;
        }
    
        // 重置游戏状态
        this.score = 0;
        this.pipes = [];
        this.coins = [];  // 重置金币数组
        this.powerUps = [];
        this.currentSpeedMultiplier = 1.0;
        this.lastTime = null;
    
        // 初始化游戏但保持暂停状态
        this.gameState = GAME_STATE.PLAYING;
        // 设置等待开始状态为true
        this.isWaitingForStart = true;
        
        // 初始化小鸟
        this.bird = new Bird(this);
        
        // 显示游戏UI
        this.ui.showGameUI();
        // 更新暂停按钮状态
        this.ui.updatePauseButtonText();
        // 仅在确认UI方法存在时调用
        if (this.ui.updatePowerupStatus) {
            this.ui.updatePowerupStatus("", 0);
        }
    
        // 设置管道生成
        this.pipeSpawnTimer = -this.currentDifficultySettings.initialPipeDelay; // 使用难度设置中的初始延迟
        this.setNextPipeSpawnInterval();
    
        // 设置输入监听
        this.setupInputListeners();
    
        // 开始游戏循环
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.gameLoop();
    }
    
    // 修改pauseGame方法，区分暂停和开始状态
    pauseGame() {
        console.log("Pausing game...");
        if (this.gameState === GAME_STATE.PLAYING) {
            this.gameState = GAME_STATE.PAUSED;
            // 移除游戏中的点击事件处理器
            document.removeEventListener("click", this.inputHandler);
            document.removeEventListener("keydown", this.inputHandler);
            
            // 保留Ctrl键监听器用于恢复游戏
            
            // 彻底停止游戏循环
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            // 保留当前游戏状态
            this.lastTime = performance.now();
            
            // 更新UI状态
            this.ui.updatePauseButtonText();
            
            // 绘制暂停界面，只有在不是等待开始状态时才显示暂停界面
            if (!this.isWaitingForStart) {
                this.drawPausedState();
            } else {
                // 如果是等待开始状态，继续绘制开始界面
                this.draw();
            }
            
            // 添加画布点击恢复监听
            this.resumeHandler = (e) => {
                if (this.gameState === GAME_STATE.PAUSED) {
                    this.resumeGame();
                }
            };
            
            // 使用捕获阶段来确保这个事件处理器最先执行
            document.addEventListener("click", this.resumeHandler, true);
        }
    }
    
    // 修改drawPausedState方法，确保只在真正暂停时显示"Tap to continue"
    drawPausedState() {
        console.log("Drawing paused state..."); // 调试日志
        this.ctx.save();
        
        // 用黑白滤镜重绘当前画面
        this.ctx.filter = 'grayscale(100%)';
        this.draw();
        
        // 添加半透明黑色遮罩
        this.ctx.filter = 'none';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制提示图片
        if (this.helpImage && this.helpImage.complete) {
            const x = (CANVAS_WIDTH - HELP_IMAGE_WIDTH) / 2;
            const y = (CANVAS_HEIGHT - HELP_IMAGE_HEIGHT) / 2;
            this.ctx.drawImage(this.helpImage, x, y, HELP_IMAGE_WIDTH, HELP_IMAGE_HEIGHT);
            
            // 绘制文字
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Tap to continue', CANVAS_WIDTH / 2, y + HELP_IMAGE_HEIGHT + 30);
        }
        
        this.ctx.restore();
    }
    
    // 修改setupInputListeners方法，处理开始状态的点击
    setupInputListeners() {
        if (this.inputHandler) {
            document.removeEventListener("click", this.inputHandler);
            document.removeEventListener("keydown", this.inputHandler);
        }
    
        // 添加一个专门用于Ctrl键的事件处理器
        this.ctrlKeyHandler = (e) => {
            // 检查是否按下了Ctrl键
            if (e.key === 'Control' || e.keyCode === 17) {
                console.log("Ctrl key pressed");
                if (this.gameState === GAME_STATE.PLAYING) {
                    this.pauseGame();
                } else if (this.gameState === GAME_STATE.PAUSED) {
                    this.resumeGame();
                }
            }
        };
    
        // 原有的输入处理
        this.inputHandler = (e) => {
            if (this.gameState === GAME_STATE.PLAYING) {
                if (this.isWaitingForStart) {
                    // 检查点击是否在开始按钮区域内
                    const x = (CANVAS_WIDTH - 100) / 2;
                    const y = (CANVAS_HEIGHT - HELP_IMAGE_HEIGHT) / 2 + 50 + HELP_IMAGE_HEIGHT + 20;
                    const width = 100;
                    const height = 50;
                    
                    // 获取点击坐标
                    let clickX, clickY;
                    if (e.type === "click") {
                        const rect = this.canvas.getBoundingClientRect();
                        clickX = e.clientX - rect.left;
                        clickY = e.clientY - rect.top;
                    }
                    
                    // 如果点击在开始按钮区域内或者按下了空格/上箭头键
                    if ((e.type === "click" && 
                         clickX >= x && clickX <= x + width && 
                         clickY >= y && clickY <= y + height) || 
                        (e.type === "keydown" && (e.code === "Space" || e.code === "ArrowUp"))) {
                        this.isWaitingForStart = false;
                        // 更新暂停按钮状态
                        this.ui.updatePauseButtonText();
                        return;
                    }
                } else if (this.bird && (e.type === "click" || (e.type === "keydown" && (e.code === "Space" || e.code === "ArrowUp")))) {
                    this.bird.flap();
                }
            }
        };
    
        // 添加事件监听
        document.addEventListener("click", this.inputHandler);
        document.addEventListener("keydown", this.inputHandler);
        document.addEventListener("keydown", this.ctrlKeyHandler);  // 添加Ctrl键监听
    }

    restartGame() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        document.removeEventListener("click", this.inputHandler);
        document.removeEventListener("keydown", this.inputHandler);
        document.removeEventListener("keydown", this.ctrlKeyHandler); // 删除Ctrl键监听
        this.startGame(); // Will re-select current difficulty and start
    }

    gameOver() {
        if (this.gameState === GAME_STATE.GAME_OVER) return;
        
        // 播放碰撞音效
        this.crashSound.currentTime = 0;
        this.crashSound.play().catch(e => console.log("Audio play failed:", e));
        
        // 清理所有道具效果
        this.deactivateMagnet();
        this.deactivateDoubleScore();
        if (this.bird) {
            this.bird.deactivateShield();
        }
        this.currentSpeedMultiplier = 1.0;

        this.gameState = GAME_STATE.GAME_OVER;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem("pixelBirdHighScore", this.highScore);
        }
        
        // 清除动画和事件监听器
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.inputHandler) {
            document.removeEventListener("click", this.inputHandler);
            document.removeEventListener("keydown", this.inputHandler);
        }
        
        this.ui.showGameOverScreen(this.score, this.highScore);
    }

    setNextPipeSpawnInterval() {
        this.nextPipeSpawnInterval = Math.random() * 
            (this.currentDifficultySettings.pipeSpawnIntervalMax - this.currentDifficultySettings.pipeSpawnIntervalMin) 
            + this.currentDifficultySettings.pipeSpawnIntervalMin;
    }

    spawnPipePair() {
        // 使用当前难度设置中的概率参数
        const collectibleOnlyChance = this.currentDifficultySettings.collectibleOnlyChance || COLLECTIBLE_ONLY_CHANCE;
        const secondCollectibleChance = this.currentDifficultySettings.secondCollectibleChance || SECOND_COLLECTIBLE_CHANCE;
        const thirdCollectibleChance = this.currentDifficultySettings.thirdCollectibleChance || THIRD_COLLECTIBLE_CHANCE;
        const branchSpawnChance = this.currentDifficultySettings.branchSpawnChance || BRANCH_SPAWN_CHANCE;
        const smokeSpawnChance = this.currentDifficultySettings.smokeSpawnChance || SMOKE_SPAWN_CHANCE;

        // 根据难度设置的概率决定是否只生成收集物
        const onlySpawnCollectible = Math.random() < collectibleOnlyChance;
        
        let x = CANVAS_WIDTH;
        let spawnY = CANVAS_HEIGHT / 2; // 默认值，如果不生成管道则用于道具/金币的生成位置
        let secondSpawnY = null;
        
        // 如果不是只生成收集物，则生成管道对
        if (!onlySpawnCollectible) {
            const newPipePair = new PipePair(this, x);
            this.pipes.push(newPipePair);
            spawnY = newPipePair.holeY; // 使用管道空隙的位置
        } else {
            // 如果只生成收集物，随机决定Y位置，确保不会与现有收集物重叠
            spawnY = this.getValidCollectiblePosition(x, 100, CANVAS_HEIGHT - 100, 15);
            
            // 检查是否生成树枝障碍物（只在没有管道的情况下生成）
            if (Math.random() < branchSpawnChance) {
                this.powerUps.push(new PowerUp(this, x + PIPE_WIDTH/2, spawnY, "branch"));
            }
            // 检查是否生成烟雾道具（只在没有管道的情况下生成）
            else if (Math.random() < smokeSpawnChance) {
                this.powerUps.push(new PowerUp(this, x + PIPE_WIDTH/2, spawnY, "smoke"));
            }
            // 否则生成常规收集物
            else {
                // 生成第二个收集物的逻辑
                if (Math.random() < secondCollectibleChance) {
                    // 随机决定在第一个收集物上方或下方
                    const isAbove = Math.random() < 0.5;
                    let minDistance = MIN_COLLECTIBLE_DISTANCE + 50; // 确保最小距离比MIN_COLLECTIBLE_DISTANCE大
                    let maxDistance = minDistance + 150; // 设置一个合理的最大距离范围
                    
                    // 确定第二个收集物的Y坐标范围
                    let minY, maxY;
                    if (isAbove) {
                        minY = 70;
                        maxY = Math.max(minY, spawnY - minDistance);
                    } else {
                        minY = spawnY + minDistance;
                        maxY = CANVAS_HEIGHT - 70;
                    }
                    
                    // 如果范围合理，则生成第二个收集物
                    if (minY < maxY) {
                        secondSpawnY = this.getValidCollectiblePosition(x, minY, maxY, 15);
                        
                        // 随机决定生成金币或道具
                        if (Math.random() < 0.5) {
                            // 生成金币
                            const type = Math.random() < 0.3 ? 'gold' : 'silver';
                            this.coins.push(new Coin(this, x + PIPE_WIDTH/2, secondSpawnY, type));
                        } else {
                            // 生成常规道具（不包括树枝和烟雾）
                            const powerupTypes = ["shield", "magnet", "doubleScore"];
                            const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                            this.powerUps.push(new PowerUp(this, x + PIPE_WIDTH/2, secondSpawnY, type));
                        }
                        
                        // 生成第三个收集物的逻辑
                        if (secondSpawnY && Math.random() < thirdCollectibleChance) {
                            // 确定第三个收集物的位置
                            // 如果前两个是上下排列，那么第三个放在中间
                            // 如果前两个是在同一高度，那么第三个放在不同高度
                            let thirdSpawnY;
                            let minY, maxY;
                            
                            if (Math.abs(spawnY - secondSpawnY) > minDistance * 2) {
                                // 前两个收集物距离足够远，第三个放中间
                                minY = Math.min(spawnY, secondSpawnY) + minDistance;
                                maxY = Math.max(spawnY, secondSpawnY) - minDistance;
                                
                                if (minY < maxY) {
                                    thirdSpawnY = this.getValidCollectiblePosition(x, minY, maxY, 15);
                                }
                            } else {
                                // 前两个收集物较近，第三个错开放置
                                // 找出最高和最低点
                                const minExistingY = Math.min(spawnY, secondSpawnY);
                                const maxExistingY = Math.max(spawnY, secondSpawnY);
                                
                                // 随机决定放在上方还是下方
                                const placeAbove = Math.random() < 0.5;
                                
                                if (placeAbove && minExistingY - minDistance > 70) {
                                    minY = 70;
                                    maxY = minExistingY - minDistance;
                                    thirdSpawnY = this.getValidCollectiblePosition(x, minY, maxY, 15);
                                } else if (!placeAbove && maxExistingY + minDistance < CANVAS_HEIGHT - 70) {
                                    minY = maxExistingY + minDistance;
                                    maxY = CANVAS_HEIGHT - 70;
                                    thirdSpawnY = this.getValidCollectiblePosition(x, minY, maxY, 15);
                                }
                            }
                            
                            // 如果找到合适的位置，生成第三个收集物
                            if (thirdSpawnY) {
                                // 随机决定生成金币或道具
                                if (Math.random() < 0.5) {
                                    // 生成金币
                                    const type = Math.random() < 0.3 ? 'gold' : 'silver';
                                    this.coins.push(new Coin(this, x + PIPE_WIDTH/2, thirdSpawnY, type));
                                } else {
                                    // 生成常规道具（不包括树枝和烟雾）
                                    const powerupTypes = ["shield", "magnet", "doubleScore"];
                                    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
                                    this.powerUps.push(new PowerUp(this, x + PIPE_WIDTH/2, thirdSpawnY, type));
                                }
                            }
                        }
                    }
                }
            }
        }

        // 优先判断是否生成金币
        if ((Math.random() < COIN_SPAWN_CHANCE || onlySpawnCollectible) && !this.isCollectibleTooClose(x + PIPE_WIDTH/2, spawnY)) {
            const type = Math.random() < 0.3 ? 'gold' : 'silver';
            this.coins.push(new Coin(this, x + PIPE_WIDTH/2, spawnY, type));
        }
        // 如果没有生成金币，则考虑生成道具
        else if ((Math.random() < POWERUP_SPAWN_CHANCE || onlySpawnCollectible) && !this.isCollectibleTooClose(x + PIPE_WIDTH/2, spawnY)) {
            // 只生成常规道具，不包括树枝和烟雾（它们已在上面专门处理）
            const powerupTypes = ["shield", "magnet", "doubleScore"];
            const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            this.powerUps.push(new PowerUp(this, x + PIPE_WIDTH/2, spawnY, type));
        }
    }

    updatePipes(deltaTime) {
        this.pipeSpawnTimer += deltaTime;
        if (this.pipeSpawnTimer > this.nextPipeSpawnInterval / this.currentSpeedMultiplier) {
            this.spawnPipePair();
            this.pipeSpawnTimer = 0;
            this.setNextPipeSpawnInterval();
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipePair = this.pipes[i];
            pipePair.topPipe.speed = this.currentDifficultySettings.pipeSpeed * this.currentSpeedMultiplier;
            pipePair.bottomPipe.speed = this.currentDifficultySettings.pipeSpeed * this.currentSpeedMultiplier;
            pipePair.update();

            if (pipePair.isOffscreen()) {
                this.pipes.splice(i, 1);
            }
        }
    }

    updateCoinsAndPowerUps(deltaTime) {
        const currentSpeed = this.currentDifficultySettings.pipeSpeed * this.currentSpeedMultiplier;
        
        // Coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.speed = currentSpeed;
            
            // 增强磁铁效果逻辑
            if (this.isMagnetActive && this.bird) {
                // 计算金币与小鸟的距离
                const dx = this.bird.x - coin.x;
                const dy = this.bird.y - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 如果在磁铁吸引范围内
                if (distance < MAGNET_RADIUS) {
                    // 计算吸引方向
                    const angle = Math.atan2(dy, dx);
                    // 增强吸引速度，使用MAGNET_STRENGTH常量
                    const attractionSpeed = MAGNET_STRENGTH * (1 - distance / MAGNET_RADIUS);
                    
                    // 向小鸟移动，增加移动速度
                    coin.x += Math.cos(angle) * attractionSpeed * 2;
                    coin.y += Math.sin(angle) * attractionSpeed * 2;
                    
                    // 如果非常接近小鸟，直接吸附
                    if (distance < 30) {
                        coin.x = this.bird.x;
                        coin.y = this.bird.y;
                    }
                }
            }
            
            coin.update(deltaTime);
            if (coin.isOffscreen() || coin.collected) {
                this.coins.splice(i, 1);
            }
        }
        
        // PowerUps
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.speed = currentSpeed;
            powerUp.update(deltaTime);
            if (powerUp.isOffscreen() || powerUp.collected) {
                this.powerUps.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        if (!this.bird) return;  // 添加安全检查
        
        const birdBounds = this.bird.getBounds();

        // Bird vs Pipes
        for (const pipePair of this.pipes) {
            if (checkCollision(birdBounds, pipePair.topPipe.getBounds()) || 
                checkCollision(birdBounds, pipePair.bottomPipe.getBounds())) {
                if (!this.bird.isShieldActive) {
                    this.gameOver();
                    return;
                }
            }
            if (!pipePair.passed && birdBounds.x > pipePair.x + pipePair.width) {
                pipePair.passed = true;
                // 修改这里，考虑双倍得分效果
                if (this.isDoubleScoreActive) {
                    this.score += 2;  // 双倍得分
                } else {
                    this.score++;  // 正常得分
                }
            }
        }

        // Bird vs PowerUps
        for (const powerUp of this.powerUps) {
            if (!powerUp.collected && checkCollision(birdBounds, powerUp.getBounds())) {
                powerUp.activate();
            }
        }

        // Bird vs Coins
        for (const coin of this.coins) {
            if (!coin.collected && checkCollision(birdBounds, coin.getBounds())) {
                coin.collected = true;
                let value = coin.value;
                if (this.isDoubleScoreActive) value *= 2;
                this.score += value;  // 直接加入总分
            }
        }
    }

    activateMagnet(duration) {
        this.isMagnetActive = true;
        this.magnetEndTime = Date.now() + duration;
        this.ui.updatePowerupStatus("磁铁", duration / 1000);
    }

    deactivateMagnet() {
        this.isMagnetActive = false;
        this.ui.updatePowerupStatus("", 0);
    }

    activateDoubleScore(duration) {
        this.isDoubleScoreActive = true;
        this.doubleScoreEndTime = Date.now() + duration;
        this.ui.updatePowerupStatus("双倍得分", duration / 1000);
    }

    deactivateDoubleScore() {
        this.isDoubleScoreActive = false;
        this.ui.updatePowerupStatus("", 0);
    }

    activateSmoke(duration) {
        this.isSmokeActive = true;
        this.smokeEndTime = Date.now() + duration;
        this.ui.updatePowerupStatus("烟雾", duration / 1000);
    }

    deactivateSmoke() {
        this.isSmokeActive = false;
        this.ui.updatePowerupStatus("", 0);
    }

    handleActivePowerUps(deltaTime) {
        // 检查磁铁状态
        if (this.isMagnetActive && Date.now() > this.magnetEndTime) {
            this.deactivateMagnet();
        }
    
        // 检查双倍得分状态
        if (this.isDoubleScoreActive && Date.now() > this.doubleScoreEndTime) {
            this.deactivateDoubleScore();
        }
        
        // 检查烟雾状态
        if (this.isSmokeActive && Date.now() > this.smokeEndTime) {
            this.deactivateSmoke();
        }
        
        // 检查护盾状态
        if (this.bird && this.bird.isShieldActive) {
            this.currentSpeedMultiplier = SHIELD_SPEED_BOOST;
            this.ui.updatePowerupStatus("护盾", (this.bird.shieldEndTime - Date.now()) / 1000);
        } else if (this.currentSpeedMultiplier !== 1.0 && !(this.bird && this.bird.isShieldActive)) {
            this.currentSpeedMultiplier = 1.0;
        }
        
        // 更新UI显示 - 按优先级显示（只显示一个道具）
        if (this.bird && this.bird.isShieldActive) {
            this.ui.updatePowerupStatus("护盾", (this.bird.shieldEndTime - Date.now()) / 1000);
        } else if (this.isMagnetActive) {
            this.ui.updatePowerupStatus("磁铁", (this.magnetEndTime - Date.now()) / 1000);
        } else if (this.isDoubleScoreActive) {
            this.ui.updatePowerupStatus("双倍得分", (this.doubleScoreEndTime - Date.now()) / 1000);
        } else if (this.isSmokeActive) {
            this.ui.updatePowerupStatus("烟雾", (this.smokeEndTime - Date.now()) / 1000);
        } else {
            this.ui.updatePowerupStatus("", 0);
        }
    }

    drawBackground() {
        if (this.backgroundImage && this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            // 后备背景
            this.ctx.fillStyle = '#70c5ce';
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }

    drawScore() {
        const score = this.score.toString();
        const totalWidth = (SCORE_NUMBER_WIDTH + SCORE_PADDING) * score.length - SCORE_PADDING;
        let startX = (CANVAS_WIDTH - totalWidth) / 2;

        for (let i = 0; i < score.length; i++) {
            const digit = parseInt(score[i]);
            const numberImage = this.images[SCORE_NUMBERS[digit]];
            if (numberImage && numberImage.complete) {
                this.ctx.drawImage(
                    numberImage,
                    startX,
                    SCORE_Y_POSITION,
                    SCORE_NUMBER_WIDTH,
                    SCORE_NUMBER_HEIGHT
                );
            }
            startX += SCORE_NUMBER_WIDTH + SCORE_PADDING;
        }
    }

    update(deltaTime) {
        // 在等待开始状态下，只更新小鸟的动画
        if (this.isWaitingForStart) {
            if (this.bird) {
                this.bird.updateAnimation(deltaTime);
            }
            return;
        }

        // 更新逻辑
        if (this.bird) {
            this.bird.update(deltaTime);
        }
        this.updatePipes(deltaTime);
        this.updateCoinsAndPowerUps(deltaTime);
        this.handleActivePowerUps(deltaTime);
        this.checkCollisions();
    }

    gameLoop(currentTime = 0) {
        // 如果游戏不在运行状态，直接返回
        if (this.gameState !== GAME_STATE.PLAYING) {
            console.log("Game not in playing state:", this.gameState); // 调试日志
            if (this.gameState === GAME_STATE.PAUSED) {
                this.drawPausedState();
            }
            return;
        }

        const deltaTime = currentTime - (this.lastTime || currentTime);
        this.lastTime = currentTime;

        // 在等待状态下，只绘制场景和提示
        if (this.isWaitingForStart) {
            this.draw();
            this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }

        // 正常游戏逻辑
        if (this.bird) {
            this.bird.update(deltaTime);
        }
        this.updatePipes(deltaTime);
        this.updateCoinsAndPowerUps(deltaTime);
        this.handleActivePowerUps(deltaTime);
        this.checkCollisions();

        this.draw();
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    draw() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.drawBackground();
        
        // 绘制游戏对象
        this.pipes.forEach(pipe => pipe.draw(this.ctx));
        this.coins.forEach(coin => coin.draw(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        if (this.bird) {
            this.bird.draw(this.ctx);
        }

        // 显示得分
        this.drawScore();

        // 绘制帮助图片（确保在最上层）
        if (this.isWaitingForStart) {
            // 加载ready图片
            const readyImage = new Image();
            readyImage.src = ASSETS.ready;
            
            // 加载start图片
            const startImage = new Image();
            startImage.src = ASSETS.start;
            
            if (this.helpImage && this.helpImage.complete) {
                const x = (CANVAS_WIDTH - HELP_IMAGE_WIDTH) / 2;
                const y = (CANVAS_HEIGHT - HELP_IMAGE_HEIGHT) / 2 + 50;
                
                // 绘制帮助图片
                this.ctx.drawImage(this.helpImage, x, y, HELP_IMAGE_WIDTH, HELP_IMAGE_HEIGHT);
                
                // 绘制ready图片在顶部
                if (readyImage.complete) {
                    const readyWidth = 200;
                    const readyHeight = 80;
                    const readyX = (CANVAS_WIDTH - readyWidth) / 2;
                    const readyY = y - readyHeight - 20; // 在帮助图片上方20像素
                    this.ctx.drawImage(readyImage, readyX, readyY, readyWidth, readyHeight);
                }
                
                // 绘制start按钮在底部
                if (startImage.complete) {
                    const startWidth = 100;
                    const startHeight = 50;
                    const startX = (CANVAS_WIDTH - startWidth) / 2;
                    const startY = y + HELP_IMAGE_HEIGHT + 20; // 在帮助图片下方20像素
                    this.ctx.drawImage(startImage, startX, startY, startWidth, startHeight);
                }
            }
        }

        // 根据设备性能调整渲染
        if (this.isLowEndDevice) {
            // 简化渲染，例如减少粒子效果、使用更简单的动画等
            // 例如，可以跳过某些视觉效果的渲染
            if (this.isSmokeActive) {
                // 使用更简单的烟雾效果
                this.ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
                this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }
        } else {
            // 完整渲染
            if (this.isSmokeActive) {
                if (this.smokeOverlayImage && this.smokeOverlayImage.complete) {
                    this.ctx.globalAlpha = 0.7;
                    this.ctx.drawImage(this.smokeOverlayImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                    this.ctx.globalAlpha = 1.0;
                } else {
                    // 如果图片未加载，使用灰色半透明矩形作为后备
                    this.ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
                    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                }
            }
        }
    }

    resumeGame() {
        console.log("Resuming game...");
        if (this.gameState === GAME_STATE.PAUSED) {
            // 移除暂停时的点击监听器
            document.addEventListener("keydown", this.ctrlKeyHandler);
            this.resumeHandler = null;
            
            this.gameState = GAME_STATE.PLAYING;
            this.lastTime = performance.now();
            this.ui.updatePauseButtonText();
            
            // 清除可能残留的动画帧
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            // 重新设置输入监听
            this.setupInputListeners();
            
            // 重置时间基准并启动新的游戏循环
            this.lastTime = performance.now();
            this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    detectLowEndDevice() {
        // 检测设备性能
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 如果是移动设备，进一步检测性能
        if (isMobile) {
            // 检测设备内存（如果可用）
            if (navigator.deviceMemory && navigator.deviceMemory < 4) {
                return true; // 低于4GB内存认为是低端设备
            }
            
            // 检测处理器核心数（如果可用）
            if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
                return true; // 低于4核认为是低端设备
            }
        }
        
        return false;
    }

    /**
     * 检查新的收集物位置是否与现有收集物过近
     * @param {number} x - 新收集物的x坐标
     * @param {number} y - 新收集物的y坐标
     * @returns {boolean} - 如果与现有收集物距离过近返回true，否则返回false
     */
    isCollectibleTooClose(x, y) {
        // 检查与现有金币的距离
        for (const coin of this.coins) {
            const distance = Math.sqrt(Math.pow(x - coin.x, 2) + Math.pow(y - coin.y, 2));
            if (distance < MIN_COLLECTIBLE_DISTANCE) {
                return true;
            }
        }
        
        // 检查与现有道具的距离
        for (const powerUp of this.powerUps) {
            const distance = Math.sqrt(Math.pow(x - powerUp.x, 2) + Math.pow(y - powerUp.y, 2));
            if (distance < MIN_COLLECTIBLE_DISTANCE) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 获取一个与现有收集物不重叠的随机Y坐标
     * @param {number} x - 收集物的X坐标
     * @param {number} minY - 允许的最小Y坐标
     * @param {number} maxY - 允许的最大Y坐标
     * @param {number} maxAttempts - 最大尝试次数
     * @returns {number} 一个合适的Y坐标
     */
    getValidCollectiblePosition(x, minY, maxY, maxAttempts = 10) {
        let attempts = 0;
        let y;
        
        do {
            y = Math.random() * (maxY - minY) + minY;
            attempts++;
        } while (this.isCollectibleTooClose(x, y) && attempts < maxAttempts);
        
        return y;
    }
}

// Initialize the game once the DOM is ready
window.addEventListener("load", () => {
    new Game("game-canvas");
});
