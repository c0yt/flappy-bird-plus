// js/ui.js

class UI {
    constructor(game) {
        this.game = game;
        this.startScreen = document.getElementById("start-screen");
        this.difficultySelection = document.getElementById("difficulty-selection");
        this.easyBtn = document.getElementById("easy-btn");
        this.normalBtn = document.getElementById("normal-btn");
        this.hardBtn = document.getElementById("hard-btn");
        this.startGameBtn = document.getElementById("start-game-btn");

        this.gameUI = document.getElementById("game-ui");
        this.powerupStatusDisplay = document.getElementById("powerup-status");

        this.gameOverScreen = document.getElementById("game-over-screen");
        this.finalScoreDisplay = document.getElementById("final-score");
        this.highScoreDisplay = document.getElementById("high-score");
        this.restartGameBtn = document.getElementById("restart-game-btn");
        this.mainMenuBtn = document.getElementById("main-menu-btn");

        this.pauseBtn = document.getElementById("pause-btn");

        this.selectedDifficulty = null;
        this.setupEventListeners();
        this.setupPauseButton();
        // 添加暂停按钮图片
        this.pauseImage = new Image();
        this.pauseImage.src = ASSETS.pause;
    }

    setupEventListeners() {
        this.easyBtn.addEventListener("click", () => this.selectDifficulty("easy"));
        this.normalBtn.addEventListener("click", () => this.selectDifficulty("normal"));
        this.hardBtn.addEventListener("click", () => this.selectDifficulty("hard"));
        this.startGameBtn.addEventListener("click", () => {
            if (this.selectedDifficulty) {
                this.game.setDifficulty(this.selectedDifficulty);
                this.game.startGame();
            } else {
                alert("请先选择难度！");
            }
        });
        this.restartGameBtn.addEventListener("click", () => this.game.restartGame());
        this.mainMenuBtn.addEventListener("click", () => this.showStartScreen());
    }    setupPauseButton() {
        console.log("Setting up pause button"); // 调试日志
        if (!this.pauseBtn) {
            console.error("Pause button not found!");
            return;
        }
          this.handlePauseClick = (e) => {
            console.log("Pause button clicked"); // 调试日志
            // 必须在最前面阻止事件冒泡
            e.stopPropagation();
            e.preventDefault();
            
            if (this.game.gameState === GAME_STATE.PLAYING) {
                console.log("Attempting to pause game"); // 调试日志
                this.game.pauseGame();
            }
            // 移除了暂停状态下的继续功能
        };

        // 移除可能存在的旧事件监听器
        this.pauseBtn.removeEventListener("click", this.handlePauseClick);
        // 添加新的事件监听器
        this.pauseBtn.addEventListener("click", this.handlePauseClick);
    }

    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        // 移除所有按钮的选中状态和动画
        [this.easyBtn, this.normalBtn, this.hardBtn].forEach(btn => {
            btn.classList.remove('selected');
            btn.style.transform = 'scale(1)';
            btn.style.filter = 'brightness(0.9)';
        });
        
        // 为选中的按钮添加选中状态和动画
        const selectedBtn = {
            'easy': this.easyBtn,
            'normal': this.normalBtn,
            'hard': this.hardBtn
        }[difficulty];
        
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        console.log(`Difficulty selected: ${difficulty}`);
    }

    showStartScreen() {
        this.startScreen.classList.remove("hidden");
        this.difficultySelection.classList.remove("hidden");
        this.gameUI.classList.add("hidden");
        this.gameOverScreen.classList.add("hidden");
        this.selectedDifficulty = null; // Reset selected difficulty
        // 重置所有按钮状态
        [this.easyBtn, this.normalBtn, this.hardBtn].forEach(btn => {
            btn.classList.remove('selected');
            btn.style.transform = 'scale(1)';
            btn.style.filter = 'brightness(0.9)';
        });
    }

    showGameUI() {
        this.startScreen.classList.add("hidden");
        this.gameUI.classList.remove("hidden");
        this.gameOverScreen.classList.add("hidden");
        this.updatePauseButtonText();
    }

    showGameOverScreen(score, highScore) {
        this.startScreen.classList.add("hidden");
        this.gameUI.classList.add("hidden");
        this.gameOverScreen.classList.remove("hidden");
        this.finalScoreDisplay.textContent = `你的得分: ${score}`;
        this.highScoreDisplay.textContent = `最高分: ${highScore}`;
    }

    updatePowerupStatus(powerupName, timeLeft) {
        if (this.powerupStatusDisplay) {
            // 清空当前内容
            this.powerupStatusDisplay.innerHTML = "";
            
            // 如果没有激活的道具，直接返回
            if (!powerupName || timeLeft <= 0) {
                return;
            }
            
            // 创建道具图标元素
            const iconElement = document.createElement('img');
            iconElement.className = 'powerup-icon';
            
            // 根据道具类型设置图标
            switch(powerupName) {
                case '护盾':
                    iconElement.src = ASSETS.powerupShield;
                    break;
                case '磁铁':
                    iconElement.src = ASSETS.powerupMagnet;
                    break;
                case '双倍得分':
                    iconElement.src = ASSETS.powerupDoubleScore;
                    break;
                default:
                    return; // 未知道具类型，不显示
            }
            
            // 创建SVG圆形进度条
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", "50");
            svg.setAttribute("height", "50");
            svg.setAttribute("viewBox", "0 0 50 50");
            svg.setAttribute("class", "powerup-timer");
            
            // 背景圆
            const bgCircle = document.createElementNS(svgNS, "circle");
            bgCircle.setAttribute("cx", "25");
            bgCircle.setAttribute("cy", "25");
            bgCircle.setAttribute("r", "20");
            bgCircle.setAttribute("fill", "none");
            bgCircle.setAttribute("stroke", "#333");
            bgCircle.setAttribute("stroke-width", "4");
            bgCircle.setAttribute("opacity", "0.5");
            
            // 进度圆 - 计算剩余时间比例
            const progressCircle = document.createElementNS(svgNS, "circle");
            progressCircle.setAttribute("cx", "25");
            progressCircle.setAttribute("cy", "25");
            progressCircle.setAttribute("r", "20");
            progressCircle.setAttribute("fill", "none");
            progressCircle.setAttribute("stroke-width", "4");
            
            // 计算圆周长和剩余部分
            const circumference = 2 * Math.PI * 20;
            const maxDuration = POWERUP_DURATION / 1000; // 使用常量中定义的道具持续时间
            const timeRatio = Math.min(timeLeft / maxDuration, 1);
            const dashOffset = circumference * (1 - timeRatio);
            
            // 根据剩余时间比例计算颜色
            let color;
            if (timeRatio > 0.6) {
                // 从绿色到黄色的过渡 (60%-100%)
                const greenToYellowRatio = (timeRatio - 0.6) / 0.4;
                const r = Math.floor(255 * (1 - greenToYellowRatio));
                color = `rgb(${r}, 255, 0)`;
            } else {
                // 从黄色到红色的过渡 (0%-60%)
                const yellowToRedRatio = timeRatio / 0.6;
                const g = Math.floor(255 * yellowToRedRatio);
                color = `rgb(255, ${g}, 0)`;
            }
            
            progressCircle.setAttribute("stroke", color);
            progressCircle.setAttribute("stroke-dasharray", circumference);
            progressCircle.setAttribute("stroke-dashoffset", dashOffset);
            progressCircle.setAttribute("transform", "rotate(-90, 25, 25)"); // 从顶部开始
            
            // 添加元素到SVG
            svg.appendChild(bgCircle);
            svg.appendChild(progressCircle);
            
            // 添加图标和进度条到显示区域
            this.powerupStatusDisplay.appendChild(svg);
            this.powerupStatusDisplay.appendChild(iconElement);
        }
    }

    updatePauseButtonText() {
        // 使用图片替换文本
        this.pauseBtn.textContent = ''; // 清除按钮文本
        
        // 设置样式
        this.pauseBtn.style.backgroundImage = `url(${ASSETS.pause})`;
        this.pauseBtn.style.backgroundSize = 'contain';
        this.pauseBtn.style.backgroundRepeat = 'no-repeat';
        this.pauseBtn.style.backgroundPosition = 'center';
        this.pauseBtn.style.backgroundColor = 'transparent'; // 透明背景
        this.pauseBtn.style.border = 'none'; // 移除边框
        this.pauseBtn.style.width = '50px';  // 固定宽度
        this.pauseBtn.style.height = '50px'; // 固定高度
        this.pauseBtn.style.padding = '0';   // 移除内边距
        
        // 在暂停状态下或等待开始状态下隐藏暂停按钮
        this.pauseBtn.style.display = (this.game.gameState === GAME_STATE.PAUSED || this.game.isWaitingForStart) ? "none" : "block";
    }
}