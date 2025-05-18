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
        this.imageBottom.src = ASSETS.pipeTop;

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
        // 为上下管道统一使用顶部管道图像 (pipe_top.png)
        const pipeImg = this.imageTop;
        const capHeight = 26;  // 管道头部的固定高度
        
        if (!pipeImg.complete) {
            // 如果图片未加载，使用绿色矩形作为后备
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        
        ctx.save();
        
        if (this.isTopPipe) {
            // 顶部管道绘制
            // 1. 主要部分（可拉伸）
            if (this.height > capHeight) {
                ctx.drawImage(
                    pipeImg,
                    0, 0, pipeImg.width, pipeImg.height - capHeight,  // 源图像截取
                    this.x, this.y, this.width, this.height - capHeight  // 目标位置大小
                );
                
                // 2. 管道末端（固定尺寸，位于底部）
                ctx.drawImage(
                    pipeImg,
                    0, pipeImg.height - capHeight, pipeImg.width, capHeight,  // 源图像截取
                    this.x, this.y + this.height - capHeight, this.width, capHeight  // 目标位置大小
                );
            } else {
                // 如果管道太短，只绘制末端部分
                ctx.drawImage(
                    pipeImg,
                    0, pipeImg.height - capHeight, pipeImg.width, capHeight,
                    this.x, this.y, this.width, this.height
                );
            }
        } else {
            // 底部管道绘制 - 使用相同的顶部图像，但翻转
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(Math.PI);
            ctx.translate(-this.width/2, -this.height/2);
            
            // 1. 主要部分（可拉伸）
            if (this.height > capHeight) {
                ctx.drawImage(
                    pipeImg,
                    0, 0, pipeImg.width, pipeImg.height - capHeight,  // 源图像截取
                    0, 0, this.width, this.height - capHeight  // 目标位置大小
                );
                
                // 2. 管道末端（固定尺寸，位于底部在翻转的坐标系中）
                ctx.drawImage(
                    pipeImg,
                    0, pipeImg.height - capHeight, pipeImg.width, capHeight,  // 源图像截取
                    0, this.height - capHeight, this.width, capHeight  // 目标位置大小
                );
            } else {
                // 如果管道太短，只绘制末端部分
                ctx.drawImage(
                    pipeImg,
                    0, pipeImg.height - capHeight, pipeImg.width, capHeight,
                    0, 0, this.width, this.height
                );
            }
        }
        
        ctx.restore();
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

