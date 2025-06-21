// js/bird.js - 小鸟类文件，负责小鸟的渲染、物理模拟和交互行为

/**
 * 小鸟类 - 处理玩家控制的主角小鸟
 * 包含小鸟的物理属性、动画系统、碰撞检测和特殊能力（如护盾）
 */
class Bird {
    /**
     * 创建一个新的小鸟实例
     * @param {Game} game - 游戏实例的引用，用于访问全局游戏状态和配置
     */
    constructor(game) {
        // 游戏实例引用，用于访问游戏状态、难度设置等
        this.game = game;
        
        // 小鸟的基本尺寸属性，由全局常量定义
        this.width = BIRD_WIDTH;    // 小鸟宽度，影响碰撞检测和渲染大小
        this.height = BIRD_HEIGHT;  // 小鸟高度，影响碰撞检测和渲染大小
        
        // 小鸟的初始位置
        this.x = CANVAS_WIDTH / 4;  // 小鸟在屏幕左侧1/4处，水平位置固定不变
        this.y = CANVAS_HEIGHT / 2;  // 初始位置在屏幕垂直中间，之后会随玩家操作上下移动
        
        // 物理属性
        this.velocity = 0;  // 初始垂直速度为0，正值表示向下移动，负值表示向上移动
        
        // 游戏机制相关计数器
        this.framesSinceStart = 0;  // 游戏开始后的帧数计数，用于实现游戏开始时的缓冲期
        
        // 护盾系统相关属性
        this.isShieldActive = false; // 护盾激活状态标志，true表示护盾当前处于激活状态
        this.shieldEndTime = 0;      // 护盾结束的时间戳，用于计算护盾剩余时间

        // 初始化音效系统
        this.flapSound = new Audio(ASSETS.fly); // 创建翅膀拍打音效对象，引用全局资源
        this.flapSound.volume = 0.5;  // 设置音量为50%，避免音效过于刺耳

        // 初始化动画系统
        this.frames = [];           // 存储小鸟动画的所有帧图像对象
        this.currentFrame = 0;      // 当前显示的帧索引，决定显示哪一帧动画
        this.frameTimer = 0;        // 帧动画计时器，累计经过的时间，用于控制动画速度
        
        // 预加载所有动画帧图片
        // 遍历BIRD_FRAMES数组，该数组包含了所有帧的资源键名
        BIRD_FRAMES.forEach((frameKey, index) => {
            this.frames[index] = new Image(); // 为每一帧创建一个新的Image对象
            this.frames[index].src = ASSETS[frameKey]; // 从全局资源对象中获取图片URL并设置给Image对象
        });
    }

    /**
     * 小鸟跳跃方法 - 当玩家触发跳跃操作时调用
     * 设置向上的速度并播放音效
     */
    flap() {
        // 使用当前难度设置中定义的跳跃力度作为向上的速度
        // 数值为负是因为在Canvas坐标系中，y轴向下为正方向，向上为负方向
        this.velocity = this.game.currentDifficultySettings.birdFlapPower;
        
        // 播放翅膀拍打音效
        if (this.flapSound) {
            this.flapSound.currentTime = 0; // 重置音效播放位置，确保每次都从头播放
            this.flapSound.play().catch(e => console.log("音效播放失败:", e)); // 播放音效并捕获可能的错误
        }
    }

    /**
     * 激活护盾效果 - 使小鸟临时免疫碰撞伤害
     * @param {number} duration - 护盾持续时间（毫秒）
     */
    activateShield(duration) {
        this.isShieldActive = true; // 设置护盾状态为激活
        this.shieldEndTime = Date.now() + duration; // 计算护盾到期的确切时间戳
        // 更新UI以显示护盾状态和剩余时间（转换为秒显示）
        this.game.ui.updatePowerupStatus('护盾', duration / 1000);
    }

    /**
     * 停用护盾效果 - 在护盾时间结束或手动取消时调用
     */
    deactivateShield() {
        this.isShieldActive = false; // 设置护盾状态为非激活
        this.game.ui.updatePowerupStatus('', 0); // 清除UI上的护盾状态显示
    }

    /**
     * 更新小鸟状态 - 在每一帧游戏循环中调用
     * 处理物理模拟、边界检查和状态更新
     * @param {number} deltaTime - 帧间隔时间（毫秒），用于使物理计算与帧率无关
     */
    update(deltaTime) {
        // 增加游戏开始后的帧计数
        this.framesSinceStart++;
        
        // 游戏开始的前60帧（约1秒）不应用重力，给玩家反应时间
        // 这是一种游戏设计技巧，让玩家有时间准备
        if (this.framesSinceStart < 60) {
            return;
        }

        // 基于当前速度和时间增量更新小鸟的垂直位置
        // 除以16是为了标准化时间增量（基于16.67ms的标准帧时间，即60fps）
        this.y += this.velocity * (deltaTime / 16); 

        // 应用重力效果，增加小鸟的下落速度
        const gravity = this.game.currentDifficultySettings.gravity; // 从当前难度设置获取重力值
        this.velocity = Math.min(
            this.velocity + gravity * (deltaTime / 16), // 重力加速度也要根据时间增量进行调整
            15 // 最大下落速度限制，防止小鸟下落过快导致游戏体验不佳
        );

        // 限制小鸟的飞行范围，并处理边界碰撞
        // 处理上边界碰撞
        if (this.y < 0) {
            this.y = 0; // 将位置限制在边界处
            this.velocity = 0; // 重置速度，防止继续向上移动
            // 碰到上边界时，如果没有护盾则游戏结束
            if (!this.isShieldActive) {
                this.game.gameOver(); // 调用游戏结束方法
            }
        }
        // 处理下边界碰撞
        if (this.y + this.height > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.height; // 将位置限制在边界处
            this.velocity = 0; // 重置速度，防止继续向下移动
            // 碰到下边界时，如果没有护盾则游戏结束
            if (!this.isShieldActive) {
                this.game.gameOver(); // 调用游戏结束方法
            }
        }

        // 检查护盾状态是否过期，如果当前时间超过了护盾结束时间，则停用护盾
        if (this.isShieldActive && Date.now() > this.shieldEndTime) {
            this.deactivateShield(); // 调用停用护盾方法
        }

        // 更新动画帧状态
        this.updateAnimation(deltaTime);
    }

    /**
     * 更新动画状态 - 处理动画帧的切换
     * @param {number} deltaTime - 帧间隔时间（毫秒）
     */
    updateAnimation(deltaTime) {
        // 只更新动画计时器和当前帧，不影响位置计算
        this.frameTimer += deltaTime; // 累加经过的时间
        
        // 当计时器超过预定的动画速度时，切换到下一帧
        if (this.frameTimer >= BIRD_ANIMATION_SPEED) {
            // 循环播放动画，当达到最后一帧时回到第一帧
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.frameTimer = 0; // 重置计时器
        }
    }

    /**
     * 渲染小鸟 - 在Canvas上绘制小鸟及其特效
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D渲染上下文，用于绘制图形
     */
    draw(ctx) {
        // 更新动画帧 - 注意：这里的逻辑与updateAnimation有重复，可能是历史遗留问题
        this.frameTimer += 16; // 假设60fps的情况下，每帧16.67ms
        if (this.frameTimer >= BIRD_ANIMATION_SPEED) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }

        // 绘制当前动画帧
        // 检查当前帧图像是否已加载完成，避免在图像未加载完成时尝试绘制
        if (this.frames[this.currentFrame] && this.frames[this.currentFrame].complete) {
            // 使用drawImage方法将图像绘制到指定位置和大小
            ctx.drawImage(this.frames[this.currentFrame], this.x, this.y, this.width, this.height);
        }

        // 如果护盾效果激活，绘制护盾特效（一个围绕小鸟的圆形轮廓）
        if (this.isShieldActive) {
            ctx.save(); // 保存当前绘图状态
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'; // 设置半透明的青色作为护盾颜色
            ctx.lineWidth = 2; // 设置护盾边框宽度
            ctx.beginPath(); // 开始一个新的路径
            // 创建一个以小鸟中心为原点的圆，半径略大于小鸟尺寸
            ctx.arc(
                this.x + this.width/2,  // 圆心x坐标（小鸟中心）
                this.y + this.height/2, // 圆心y坐标（小鸟中心）
                Math.max(this.width, this.height)/1.5, // 圆半径，取小鸟宽高的较大值，并稍微放大
                0, // 起始角度
                Math.PI * 2 // 结束角度（完整的圆）
            );
            ctx.stroke(); // 绘制圆形轮廓
            ctx.restore(); // 恢复之前保存的绘图状态
        }
    }

    /**
     * 获取小鸟的碰撞边界 - 用于碰撞检测
     * @returns {Object} 包含位置和尺寸的边界对象，可用于与其他游戏对象进行碰撞检测
     */
    getBounds() {
        return {
            x: this.x, // 小鸟左上角的x坐标
            y: this.y, // 小鸟左上角的y坐标
            width: this.width, // 小鸟的宽度
            height: this.height // 小鸟的高度
        };
    }
}

