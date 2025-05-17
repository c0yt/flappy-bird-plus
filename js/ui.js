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
            e.preventDefault();
            e.stopPropagation();
            
            if (this.game.gameState === GAME_STATE.PLAYING) {
                console.log("Attempting to pause game"); // 调试日志
                this.game.pauseGame();
            } else if (this.game.gameState === GAME_STATE.PAUSED) {
                console.log("Attempting to resume game"); // 调试日志
                this.game.resumeGame();
            }
        };

        // 移除可能存在的旧事件监听器
        this.pauseBtn.removeEventListener("click", this.handlePauseClick);
        // 添加新的事件监听器
        this.pauseBtn.addEventListener("click", this.handlePauseClick);
    }

    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        // Visual feedback for selected difficulty
        [this.easyBtn, this.normalBtn, this.hardBtn].forEach(btn => btn.style.borderColor = "#fff");
        if (difficulty === "easy") this.easyBtn.style.borderColor = "#0f0";
        if (difficulty === "normal") this.normalBtn.style.borderColor = "#ff0";
        if (difficulty === "hard") this.hardBtn.style.borderColor = "#f00";
        console.log(`Difficulty selected: ${difficulty}`);
    }

    showStartScreen() {
        this.startScreen.classList.remove("hidden");
        this.difficultySelection.classList.remove("hidden");
        this.gameUI.classList.add("hidden");
        this.gameOverScreen.classList.add("hidden");
        this.selectedDifficulty = null; // Reset selected difficulty
        [this.easyBtn, this.normalBtn, this.hardBtn].forEach(btn => btn.style.borderColor = "#fff");
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
            if (powerupName && timeLeft > 0) {
                this.powerupStatusDisplay.textContent = `${powerupName} 剩余: ${timeLeft.toFixed(1)}s`;
            } else {
                this.powerupStatusDisplay.textContent = "";
            }
        }
    }

    updatePauseButtonText() {
        this.pauseBtn.textContent = 
            this.game.gameState === GAME_STATE.PAUSED ? "继续" : "暂停";
    }
}

