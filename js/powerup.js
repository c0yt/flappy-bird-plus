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
     * @param {string} type - 道具类型：'shield'（护盾）, 'magnet'（磁铁）, 'doubleScore'（双倍得分）, 'branch'（树枝）, 'smoke'（烟雾）
     */
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type; // 道具类型
        this.collected = false; // 是否已被收集
        this.duration = POWERUP_DURATION; // 道具效果持续时间
        this.speed = game.currentDifficultySettings.pipeSpeed || 2; // 道具移动速度，与管道同步

        // 根据道具类型设置大小和加载对应的图片
        switch (type) {
            case 'shield':
                this.size = POWERUP_SIZE;
                this.image = new Image();
                this.image.src = ASSETS.powerupShield;
                break;
            case 'magnet':
                this.size = POWERUP_SIZE;
                this.image = new Image();
                this.image.src = ASSETS.powerupMagnet;
                break;
            case 'doubleScore':
                this.size = POWERUP_SIZE;
                this.image = new Image();
                this.image.src = ASSETS.powerupDoubleScore;
                break;
            case 'branch': // 新增树枝障碍物
                this.size = BRANCH_SIZE;
                this.image = new Image();
                this.image.src = ASSETS.powerupBranch;
                break;
            case 'smoke': // 新增烟雾道具
                this.size = SMOKE_SIZE;
                this.image = new Image(350,200);
                this.image.src = ASSETS.powerupSmoke;
                this.duration = SMOKE_DURATION; // 烟雾效果持续时间
                break;
            default:
                this.size = POWERUP_SIZE;
                this.image = new Image();
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
        if (this.image && this.image.complete) {
            ctx.drawImage(
                this.image,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // 后备渲染方案，确保道具可见
            ctx.fillStyle = this.getFallbackColor();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 获取道具的碰撞边界
     * @returns {Object} 返回道具的边界对象
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
     * @returns {boolean} 如果道具已完全移出屏幕返回true
     */
    isOffscreen() {
        return this.x + this.size / 2 < 0;
    }

    /**
     * 获取道具类型对应的后备颜色
     * @returns {string} 颜色字符串
     */
    getFallbackColor() {
        switch (this.type) {
            case 'shield':
                return 'blue';
            case 'magnet':
                return 'purple';
            case 'doubleScore':
                return 'yellow';
            case 'branch':
                return 'brown';
            case 'smoke':
                return 'lightgray';
            default:
                return 'white';
        }
    }

    /**
     * 激活道具效果
     */
    activate() {
        this.collected = true;

        // 根据道具类型应用不同效果
        switch (this.type) {
            case 'shield':
                if (this.game.bird) {
                    this.game.bird.activateShield(this.duration);
                }
                break;
            case 'magnet':
                this.game.activateMagnet(this.duration);
                break;
            case 'doubleScore':
                this.game.activateDoubleScore(this.duration);
                break;
            case 'branch': // 树枝障碍物，碰到后游戏结束
                this.game.gameOver();
                break;
            case 'smoke': // 烟雾道具，碰到后增加视野遮挡效果
                this.game.activateSmoke(this.duration);
                break;
            default:
                console.warn('未知道具类型:', this.type);
        }
    }
}

