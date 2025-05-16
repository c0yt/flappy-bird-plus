// js/pipe.js

class Pipe {
    constructor(game, x, holeY, holeHeight, isTopPipe) {
        this.game = game;
        this.x = x;
        this.width = PIPE_WIDTH;
        this.speed = this.game.currentDifficultySettings?.pipeSpeed || 2;
        this.holeY = holeY;
        this.holeHeight = holeHeight;
        this.isTopPipe = isTopPipe;

        if (this.isTopPipe) {
            this.y = 0;
            this.height = this.holeY - this.holeHeight / 2;
        } else {
            this.y = this.holeY + this.holeHeight / 2;
            this.height = CANVAS_HEIGHT - this.y;
        }

        this.imageTop = new Image();
        this.imageTop.src = ASSETS.pipeTop;
        this.imageBottom = new Image();
        this.imageBottom.src = ASSETS.pipeBottom;

        // 从currentDifficultySettings获取设置
        const difficulty = this.game.currentDifficultySettings;
        this.verticalMove = difficulty?.pipeVerticalMove || 0;
        this.verticalMoveSpeed = difficulty?.pipeVerticalMoveSpeed || 0;
        this.initialY = this.y;
        this.verticalMoveDirection = 1;
        this.oscillationCounter = Math.random() * Math.PI * 2; // Randomize starting phase of oscillation
    }

    update() {
        this.x -= this.speed;

        if (this.verticalMove > 0) {
            // Oscillate pipe hole vertically
            this.oscillationCounter += this.verticalMoveSpeed;
            const dy = Math.sin(this.oscillationCounter) * this.verticalMove;

            if (this.isTopPipe) {
                this.height = (this.holeY - this.holeHeight / 2) + dy;
            } else {
                this.y = (this.holeY + this.holeHeight / 2) + dy;
                this.height = CANVAS_HEIGHT - this.y;
            }
        }
    }

    draw(ctx) {
        if (this.isTopPipe) {
            if (this.imageTop.complete) {
                ctx.drawImage(this.imageTop, this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = 'green'; // Fallback
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        } else {
            if (this.imageBottom.complete) {
                ctx.drawImage(this.imageBottom, this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = 'green'; // Fallback
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }

    isOffscreen() {
        return this.x + this.width < 0;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class PipePair {
    constructor(game, x) {
        this.game = game;
        this.x = x;
        this.width = PIPE_WIDTH;
        this.passed = false;

        // 从currentDifficultySettings获取设置而不是currentDifficulty
        const difficulty = this.game.currentDifficultySettings;
        if (!difficulty) {
            console.error('Difficulty settings not found!');
            // 使用默认值作为后备
            this.holeHeight = 150;
            this.holeY = CANVAS_HEIGHT / 2;
        } else {
            this.holeHeight = Math.random() * 
                (difficulty.pipeVerticalGapMax - difficulty.pipeVerticalGapMin) + 
                difficulty.pipeVerticalGapMin;
            
            // 确保洞不会太靠近顶部或底部
            const minHoleY = this.holeHeight / 2 + 30;
            const maxHoleY = CANVAS_HEIGHT - this.holeHeight / 2 - 30;
            this.holeY = Math.random() * (maxHoleY - minHoleY) + minHoleY;
        }

        this.topPipe = new Pipe(game, this.x, this.holeY, this.holeHeight, true);
        this.bottomPipe = new Pipe(game, this.x, this.holeY, this.holeHeight, false);
    }

    update() {
        this.topPipe.update();
        this.bottomPipe.update();
        this.x = this.topPipe.x; // Keep PipePair x in sync with its pipes
    }

    draw(ctx) {
        this.topPipe.draw(ctx);
        this.bottomPipe.draw(ctx);
    }

    isOffscreen() {
        return this.topPipe.isOffscreen();
    }
}

