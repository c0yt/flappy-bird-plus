// js/powerup.js - 游戏道具类文件

/**
 * 道具类 - 处理游戏中各种道具的行为
 */
class PowerUp {
    /**
     * 创建一个新的道具实例
     * @param {Game} game - 游戏实例的引用
     * @param {number} x - 道具的初始X坐标
     * @param {number} y - 道具的初始Y坐标
     * @param {string} type - 道具类型：'shield'（护盾）, 'magnet'（磁铁）, 'doubleScore'（双倍得分）
     */
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = POWERUP_SIZE;
        this.type = type; // 道具类型
        this.image = new Image();
        this.collected = false; // 是否已被收集
        this.duration = POWERUP_DURATION; // 道具效果持续时间
        this.speed = game.currentDifficultySettings.pipeSpeed || 2; // 道具移动速度，与管道同步

        // 根据道具类型加载对应的图片
        switch (type) {
            case 'shield':
                this.image.src = ASSETS.powerupShield;
                break;
            case 'magnet':
                this.image.src = ASSETS.powerupMagnet;
                break;
            case 'doubleScore':
                this.image.src = ASSETS.powerupDoubleScore;
                break;
            default:
                this.image.src = ''; // 默认为空，使用后备渲染方案
        }
    }

    /**
     * 更新道具位置
     * @param {number} deltaTime - 帧间隔时间
     */
    update(deltaTime) {
        // 道具向左移动，速度与管道同步
        this.x -= this.speed;
    }

    /**
     * 渲染道具
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D渲染上下文
     */
    draw(ctx) {
        // 如果道具已被收集，不再渲染
        if (this.collected) return;

        // 如果图片已加载完成，使用图片渲染
        if (this.image.complete && this.image.src) {
            ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        } else {
            // 图片未加载完成时的后备渲染方案
            ctx.fillStyle = 'purple'; // 默认颜色
            // 根据道具类型使用不同的颜色
            if (this.type === 'shield') ctx.fillStyle = 'aqua';
            if (this.type === 'magnet') ctx.fillStyle = 'pink';
            if (this.type === 'doubleScore') ctx.fillStyle = 'orange';
            // 绘制矩形作为道具图标
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }
    }

    /**
     * 激活道具效果
     */
    activate() {
        this.collected = true;
        // 根据道具类型触发不同效果
        switch (this.type) {
            case 'shield':
                // 激活护盾并提升游戏速度
                this.game.bird.activateShield(this.duration);
                this.game.currentSpeedMultiplier = SHIELD_SPEED_BOOST;
                break;
            case 'magnet':
                // 激活磁铁效果
                this.game.activateMagnet(this.duration);
                break;
            case 'doubleScore':
                // 激活双倍得分
                this.game.activateDoubleScore(this.duration);
                break;
        }
    }

    /**
     * 获取道具的碰撞边界
     * @returns {Object} 包含位置和尺寸的边界对象
     */
    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }

    /**
     * 检查道具是否已移出屏幕
     * @returns {boolean} 如果道具已移出屏幕返回true
     */
    isOffscreen() {
        return this.x + this.size < 0;
    }
}

