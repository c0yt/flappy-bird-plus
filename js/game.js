// js/game.js

class Game {    constructor(canvasId) {
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

        this.lastTime = performance.now();
        this.animationFrameId = null;
        this.isRunning = false; // 添加这行来跟踪游戏是否正在运行

        this.images = {}; // 添加图片存储对象

        this.helpImage = new Image();
        this.helpImage.src = ASSETS.tapToStart;
        this.isWaitingForStart = false; // 初始化时不显示

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

    startGame() {
        if (!this.currentDifficultySettings) {
            console.error("No difficulty settings found!");
            alert("请先选择难度再开始游戏!");
            this.ui.showStartScreen();
            return;
        }

        this.isWaitingForStart = true;  // 开始游戏时显示

        // 重置游戏状态
        this.gameState = GAME_STATE.PLAYING;
        this.score = 0;
        this.pipes = [];
        this.coins = [];  // 重置金币数组
        this.powerUps = [];
        this.currentSpeedMultiplier = 1.0;
        this.lastTime = null;
        
        // 初始化小鸟
        this.bird = new Bird(this);
        
        // 显示游戏UI
        this.ui.showGameUI();
        // 仅在确认UI方法存在时调用
        if (this.ui.updatePowerupStatus) {
            this.ui.updatePowerupStatus("", 0);
        }

        // 设置管道生成
        this.pipeSpawnTimer = 0;
        this.setNextPipeSpawnInterval();
        this.spawnPipePair();

        // 设置输入监听
        this.setupInputListeners();

        // 开始游戏循环
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.gameLoop();
    }

    setupInputListeners() {
        // 移除旧的事件监听器（如果存在）
        if (this.inputHandler) {
            document.removeEventListener("click", this.inputHandler);
            document.removeEventListener("keydown", this.inputHandler);
        }

        this.inputHandler = (e) => {
            if (this.gameState === GAME_STATE.PLAYING) {
                if (this.isWaitingForStart) {
                    this.isWaitingForStart = false;
                    return;
                }
                if (this.bird && (e.type === "click" || (e.type === "keydown" && (e.code === "Space" || e.code === "ArrowUp")))) {
                    this.bird.flap();
                }
            }
        };

        document.addEventListener("click", this.inputHandler);
        document.addEventListener("keydown", this.inputHandler);
    }

    restartGame() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        document.removeEventListener("click", this.inputHandler);
        document.removeEventListener("keydown", this.inputHandler);
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
            (PIPE_SPAWN_INTERVAL_MAX - PIPE_SPAWN_INTERVAL_MIN) + PIPE_SPAWN_INTERVAL_MIN;
    }

    spawnPipePair() {
        const x = CANVAS_WIDTH;
        const newPipePair = new PipePair(this, x);
        this.pipes.push(newPipePair);

        // 优先判断是否生成金币
        if (Math.random() < COIN_SPAWN_CHANCE) {
            const type = Math.random() < 0.3 ? 'gold' : 'silver';
            const spawnY = newPipePair.holeY; // 在管道空隙中间生成
            this.coins.push(new Coin(this, x + PIPE_WIDTH/2, spawnY, type));
        }
        // 如果没有生成金币，则考虑生成道具
        else if (Math.random() < POWERUP_SPAWN_CHANCE) {
            const powerupTypes = ["shield", "magnet", "doubleScore"];
            const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            this.powerUps.push(new PowerUp(this, x + PIPE_WIDTH/2, newPipePair.holeY, type));
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
                this.score++;
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
    }  // 确保方法正确闭合

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

    handleActivePowerUps(deltaTime) {
        // 磁铁道具已经没有作用了，因为没有金币系统
        if (this.isMagnetActive && Date.now() > this.magnetEndTime) {
            this.deactivateMagnet();
        }

        if (this.isDoubleScoreActive && Date.now() > this.doubleScoreEndTime) {
            this.deactivateDoubleScore();
        }
        
        if (this.bird && this.bird.isShieldActive) {
            this.currentSpeedMultiplier = SHIELD_SPEED_BOOST;
            this.ui.updatePowerupStatus("护盾", (this.bird.shieldEndTime - Date.now()) / 1000);
        } else if (this.currentSpeedMultiplier !== 1.0 && !(this.bird && this.bird.isShieldActive)) {
            this.currentSpeedMultiplier = 1.0;
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
    }    update(deltaTime) {
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
        if (this.isWaitingForStart && this.helpImage && this.helpImage.complete) {
            const x = (CANVAS_WIDTH - HELP_IMAGE_WIDTH) / 2;
            const y = (CANVAS_HEIGHT - HELP_IMAGE_HEIGHT) / 2 + 50;
            this.ctx.drawImage(this.helpImage, x, y, HELP_IMAGE_WIDTH, HELP_IMAGE_HEIGHT);
            
            // 添加文字提示
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('点击开始游戏', CANVAS_WIDTH / 2, y + HELP_IMAGE_HEIGHT + 30);
        }
    }    pauseGame() {
        console.log("Pausing game...");
        if (this.gameState === GAME_STATE.PLAYING) {
            this.gameState = GAME_STATE.PAUSED;
            // 移除游戏中的点击事件处理器
            document.removeEventListener("click", this.inputHandler);
            document.removeEventListener("keydown", this.inputHandler);
            
            // 彻底停止游戏循环
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            // 保留当前游戏状态
            this.lastTime = performance.now();
            
            // 更新UI状态
            this.ui.updatePauseButtonText();
            
            // 绘制暂停界面
            this.drawPausedState();
            
            // 添加画布点击恢复监听
            this.resumeHandler = (e) => {
                if (this.gameState === GAME_STATE.PAUSED) {
                    this.resumeGame();
                }
            };
            
            // 使用捕获阶段来确保这个事件处理器最先执行
            document.addEventListener("click", this.resumeHandler, true);
        }
    }    resumeGame() {
        console.log("Resuming game...");
        if (this.gameState === GAME_STATE.PAUSED) {
            // 移除暂停时的点击监听器
            document.removeEventListener("click", this.resumeHandler, true);
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
            this.ctx.fillText('点击继续游戏', CANVAS_WIDTH / 2, y + HELP_IMAGE_HEIGHT + 30);
        }
        
        this.ctx.restore();
    }
}

// Initialize the game once the DOM is ready
window.addEventListener("load", () => {
    new Game("game-canvas");
});
