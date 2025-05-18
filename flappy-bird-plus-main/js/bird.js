// js/bird.js

class Bird {
    constructor(game) {
        this.game = game;
        this.width = BIRD_WIDTH;
        this.height = BIRD_HEIGHT;
        this.x = CANVAS_WIDTH / 4;
        this.y = CANVAS_HEIGHT / 2;
        this.velocity = 0;
        this.framesSinceStart = 0; // 添加游戏开始后的帧数计数
        this.isShieldActive = false;
        this.shieldEndTime = 0;

        // 初始化音效
        this.flapSound = new Audio(ASSETS.fly);
        this.flapSound.volume = 0.5;  // 设置音量

        // 加载鸟的动画帧
        this.frames = [];
        this.currentFrame = 0;
        this.frameTimer = 0;
        
        // 预加载所有帧
        BIRD_FRAMES.forEach((frameKey, index) => {
            this.frames[index] = new Image();
            this.frames[index].src = ASSETS[frameKey];
        });
    }

    flap() {
        this.velocity = this.game.currentDifficultySettings.birdFlapPower; // 使用难度设置的跳跃力度
        // 播放翅膀拍打音效
        if (this.flapSound) {
            this.flapSound.currentTime = 0;
            this.flapSound.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    activateShield(duration) {
        this.isShieldActive = true;
        this.shieldEndTime = Date.now() + duration;
        this.game.ui.updatePowerupStatus('护盾', duration / 1000);
    }

    deactivateShield() {
        this.isShieldActive = false;
        this.game.ui.updatePowerupStatus('', 0);
    }

    update(deltaTime) {
        this.framesSinceStart++;
        
        // 在游戏开始的前几帧不应用重力，给玩家反应时间
        if (this.framesSinceStart < 60) {
            return;
        }

        // 更新小鸟的位置
        this.y += this.velocity * (deltaTime / 16); // 标准化时间增量

        // 应用重力，但确保不会太快
        const gravity = this.game.currentDifficultySettings.gravity;
        this.velocity = Math.min(
            this.velocity + gravity * (deltaTime / 16),
            15 // 最大下落速度
        );

        // 限制小鸟的飞行范围
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
        if (this.y + this.height > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.height;
            this.velocity = 0;
            if (!this.isShieldActive) {
                this.game.gameOver();
            }
        }

        // 检查护盾状态
        if (this.isShieldActive && Date.now() > this.shieldEndTime) {
            this.deactivateShield();
        }

        // 更新动画帧
        this.updateAnimation(deltaTime);
    }

    updateAnimation(deltaTime) {
        // 只更新动画，不更新位置
        this.frameTimer += deltaTime;
        if (this.frameTimer >= BIRD_ANIMATION_SPEED) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.frameTimer = 0;
        }
    }

    draw(ctx) {
        // 更新动画帧
        this.frameTimer += 16; // 假设60fps
        if (this.frameTimer >= BIRD_ANIMATION_SPEED) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }

        // 绘制当前帧
        if (this.frames[this.currentFrame] && this.frames[this.currentFrame].complete) {
            ctx.drawImage(this.frames[this.currentFrame], this.x, this.y, this.width, this.height);
        }

        // 如果有护盾效果，绘制护盾
        if (this.isShieldActive) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                   Math.max(this.width, this.height)/1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
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

