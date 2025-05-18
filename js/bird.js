// js/bird.js - 小鸟类文件

/**
 * 小鸟类 - 处理玩家控制的主角小鸟
 */
class Bird {
    /**
     * 创建一个新的小鸟实例
     * @param {Game} game - 游戏实例的引用
     */
    constructor(game) {
        this.game = game;
        this.width = BIRD_WIDTH;
        this.height = BIRD_HEIGHT;
        this.x = CANVAS_WIDTH / 4;  // 小鸟在屏幕左侧1/4处
        this.y = CANVAS_HEIGHT / 2;  // 初始位置在屏幕中间
        this.velocity = 0;  // 初始垂直速度为0
        this.framesSinceStart = 0;  // 游戏开始后的帧数计数
        this.isShieldActive = false; // 护盾状态
        this.shieldEndTime = 0;      // 护盾结束时间

        // 初始化音效
        this.flapSound = new Audio(ASSETS.fly);
        this.flapSound.volume = 0.5;  // 设置音量为50%

        // 加载小鸟的动画帧
        this.frames = [];
        this.currentFrame = 0;  // 当前显示的帧索引
        this.frameTimer = 0;    // 帧动画计时器
        
        // 预加载所有动画帧图片
        BIRD_FRAMES.forEach((frameKey, index) => {
            this.frames[index] = new Image();
            this.frames[index].src = ASSETS[frameKey];
        });
    }

    /**
     * 小鸟跳跃
     */
    flap() {
        // 使用难度设置中定义的跳跃力度
        this.velocity = this.game.currentDifficultySettings.birdFlapPower;
        // 播放翅膀拍打音效
        if (this.flapSound) {
            this.flapSound.currentTime = 0; // 重置音效播放位置
            this.flapSound.play().catch(e => console.log("音效播放失败:", e));
        }
    }

    /**
     * 激活护盾效果
     * @param {number} duration - 护盾持续时间（毫秒）
     */
    activateShield(duration) {
        this.isShieldActive = true;
        this.shieldEndTime = Date.now() + duration;
        this.game.ui.updatePowerupStatus('护盾', duration / 1000);
    }

    /**
     * 停用护盾效果
     */
    deactivateShield() {
        this.isShieldActive = false;
        this.game.ui.updatePowerupStatus('', 0);
    }

    /**
     * 更新小鸟状态
     * @param {number} deltaTime - 帧间隔时间
     */
    update(deltaTime) {
        this.framesSinceStart++;
        
        // 游戏开始的前60帧不应用重力，给玩家反应时间
        if (this.framesSinceStart < 60) {
            return;
        }

        // 更新小鸟的位置
        this.y += this.velocity * (deltaTime / 16); // 标准化时间增量

        // 应用重力，但确保不会太快
        const gravity = this.game.currentDifficultySettings.gravity;
        this.velocity = Math.min(
            this.velocity + gravity * (deltaTime / 16),
            15 // 最大下落速度限制
        );

        // 限制小鸟的飞行范围
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
            // 碰到上边界时，如果没有护盾则游戏结束
            if (!this.isShieldActive) {
                this.game.gameOver();
            }
        }
        if (this.y + this.height > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.height;
            this.velocity = 0;
            // 碰到下边界时，如果没有护盾则游戏结束
            if (!this.isShieldActive) {
                this.game.gameOver();
            }
        }

        // 检查护盾状态是否过期
        if (this.isShieldActive && Date.now() > this.shieldEndTime) {
            this.deactivateShield();
        }

        // 更新动画帧
        this.updateAnimation(deltaTime);
    }

    /**
     * 更新动画状态
     * @param {number} deltaTime - 帧间隔时间
     */
    updateAnimation(deltaTime) {
        // 只更新动画，不更新位置
        this.frameTimer += deltaTime;
        if (this.frameTimer >= BIRD_ANIMATION_SPEED) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.frameTimer = 0;
        }
    }

    /**
     * 渲染小鸟
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D渲染上下文
     */
    draw(ctx) {
        // 更新动画帧
        this.frameTimer += 16; // 假设60fps的情况
        if (this.frameTimer >= BIRD_ANIMATION_SPEED) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }

        // 绘制当前帧
        if (this.frames[this.currentFrame] && this.frames[this.currentFrame].complete) {
            ctx.drawImage(this.frames[this.currentFrame], this.x, this.y, this.width, this.height);
        }

        // 如果护盾效果激活，绘制护盾特效
        if (this.isShieldActive) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'; // 半透明的青色
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                   Math.max(this.width, this.height)/1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    /**
     * 获取小鸟的碰撞边界
     * @returns {Object} 包含位置和尺寸的边界对象
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

