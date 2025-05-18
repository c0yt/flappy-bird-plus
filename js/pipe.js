// js/pipe.js - 管道类文件

/**
 * 单个管道类 - 处理游戏中的单个管道
 */
class Pipe {
    /**
     * 创建一个新的管道实例
     * @param {Game} game - 游戏实例的引用
     * @param {number} x - 管道的初始X坐标
     * @param {number} holeY - 管道空隙的Y坐标中心点
     * @param {number} holeHeight - 管道空隙的高度
     * @param {boolean} isTopPipe - 是否是顶部管道
     */
    constructor(game, x, holeY, holeHeight, isTopPipe) {
        this.game = game;
        this.x = x;
        this.width = PIPE_WIDTH;
        this.speed = this.game.currentDifficultySettings?.pipeSpeed || 2;
        this.holeY = holeY;
        this.holeHeight = holeHeight;
        this.isTopPipe = isTopPipe;

        // 根据是否为顶部管道设置位置和高度
        if (this.isTopPipe) {
            this.y = 0;  // 顶部管道从画布顶部开始
            this.height = this.holeY - this.holeHeight / 2;  // 计算顶部管道高度
        } else {
            this.y = this.holeY + this.holeHeight / 2;  // 底部管道的起始位置
            this.height = CANVAS_HEIGHT - this.y;  // 计算底部管道高度
        }

        // 加载管道图片资源
        this.imageTop = new Image();
        this.imageTop.src = ASSETS.pipeTop;
        this.imageBottom = new Image();
        this.imageBottom.src = ASSETS.pipeTop;

        // 从难度设置中获取管道移动参数
        const difficulty = this.game.currentDifficultySettings;
        this.verticalMove = difficulty?.pipeVerticalMove || 0;  // 垂直移动幅度
        this.verticalMoveSpeed = difficulty?.pipeVerticalMoveSpeed || 0;  // 垂直移动速度
        this.initialY = this.y;  // 记录初始Y坐标
        this.verticalMoveDirection = 1;  // 垂直移动方向
        this.oscillationCounter = Math.random() * Math.PI * 2;  // 随机初始相位
    }

    /**
     * 更新管道状态
     */
    update() {
        // 向左移动管道
        this.x -= this.speed;

        // 如果启用了垂直移动
        if (this.verticalMove > 0) {
            // 使用正弦函数实现垂直振荡
            this.oscillationCounter += this.verticalMoveSpeed;
            const dy = Math.sin(this.oscillationCounter) * this.verticalMove;

            // 根据管道类型更新位置
            if (this.isTopPipe) {
                this.height = (this.holeY - this.holeHeight / 2) + dy;
            } else {
                this.y = (this.holeY + this.holeHeight / 2) + dy;
                this.height = CANVAS_HEIGHT - this.y;
            }
        }
    }

    /**
     * 渲染管道
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D渲染上下文
     */
    draw(ctx) {
        const pipeImg = this.imageTop;  // 使用统一的管道图像
        const capHeight = 26;  // 管道顶部装饰的高度

        // 如果图片未加载完成，使用简单的矩形代替
        if (!pipeImg.complete) {
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        ctx.save();  // 保存当前绘图状态

        if (this.isTopPipe) {
            // 绘制顶部管道
            if (this.height > capHeight) {
                // 绘制管道主体部分
                ctx.drawImage(
                    pipeImg,
                    0, 0, pipeImg.width, pipeImg.height - capHeight,  // 源图像区域
                    this.x, this.y, this.width, this.height - capHeight  // 目标区域
                );

                // 绘制管道顶部装饰
                ctx.drawImage(
                    pipeImg,
                    0, pipeImg.height - capHeight, pipeImg.width, capHeight,  // 源图像区域
                    this.x, this.y + this.height - capHeight, this.width, capHeight  // 目标区域
                );
            } else {
                // 管道高度不足时只绘制顶部装饰
                ctx.drawImage(
                    pipeImg,
                    0, pipeImg.height - capHeight, pipeImg.width, capHeight,
                    this.x, this.y, this.width, this.height
                );
            }
        } else {
            // 绘制底部管道（翻转绘制）
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(Math.PI);  // 旋转180度
            ctx.translate(-this.width/2, -this.height/2);

            // 绘制管道主体
            if (this.height > capHeight) {
                ctx.drawImage(
                    pipeImg,
                    0, 0, pipeImg.width, pipeImg.height - capHeight,
                    0, 0, this.width, this.height - capHeight
                );

                // 绘制管道顶部装饰
                ctx.drawImage(
                    pipeImg,
                    0, pipeImg.height - capHeight, pipeImg.width, capHeight,
                    0, this.height - capHeight, this.width, capHeight
                );
            } else {
                // 管道高度不足时只绘制顶部装饰
                ctx.drawImage(
                    pipeImg,
                    0, pipeImg.height - capHeight, pipeImg.width, capHeight,
                    0, 0, this.width, this.height
                );
            }
        }

        ctx.restore();  // 恢复绘图状态
    }

    /**
     * 检查管道是否已移出屏幕
     * @returns {boolean} 如果管道已完全移出屏幕左侧返回true
     */
    isOffscreen() {
        return this.x + this.width < 0;
    }

    /**
     * 获取管道的碰撞边界
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

/**
 * 管道对类 - 管理一对上下管道
 */
class PipePair {
    /**
     * 创建一个新的管道对实例
     * @param {Game} game - 游戏实例的引用
     * @param {number} x - 管道对的初始X坐标
     */
    constructor(game, x) {
        this.game = game;
        this.x = x;
        this.width = PIPE_WIDTH;
        this.passed = false;  // 标记玩家是否已通过此管道对

        // 从游戏难度设置获取参数
        const difficulty = this.game.currentDifficultySettings;
        if (!difficulty) {
            console.error('找不到难度设置！');
            // 使用默认值
            this.holeHeight = 150;
            this.holeY = CANVAS_HEIGHT / 2;
        } else {
            // 随机生成管道空隙的高度
            this.holeHeight = Math.random() * 
                (difficulty.pipeVerticalGapMax - difficulty.pipeVerticalGapMin) + 
                difficulty.pipeVerticalGapMin;

            // 确保管道空隙不会太靠近屏幕边缘
            const minHoleY = this.holeHeight / 2 + 30;
            const maxHoleY = CANVAS_HEIGHT - this.holeHeight / 2 - 30;
            this.holeY = Math.random() * (maxHoleY - minHoleY) + minHoleY;
        }

        // 创建上下两个管道实例
        this.topPipe = new Pipe(game, this.x, this.holeY, this.holeHeight, true);
        this.bottomPipe = new Pipe(game, this.x, this.holeY, this.holeHeight, false);
    }

    /**
     * 更新管道对的状态
     */
    update() {
        this.topPipe.update();
        this.bottomPipe.update();
        this.x = this.topPipe.x;  // 同步管道对的位置
    }

    /**
     * 渲染管道对
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D渲染上下文
     */
    draw(ctx) {
        this.topPipe.draw(ctx);
        this.bottomPipe.draw(ctx);
    }

    /**
     * 检查管道对是否已移出屏幕
     * @returns {boolean} 如果管道对已完全移出屏幕返回true
     */
    isOffscreen() {
        return this.topPipe.isOffscreen();
    }
}

