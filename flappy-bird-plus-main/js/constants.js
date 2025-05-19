// js/constants.js - 游戏常量配置文件 
// 画布尺寸设置
const CANVAS_WIDTH = 320;  // 像素艺术游戏的典型宽度，适合移动设备
const CANVAS_HEIGHT = 480; // 竖屏手机游戏的典型高度，保持16:9比例

// 游戏物理参数设置
const GRAVITY = 0.25;      // 重力加速度，影响小鸟下落速度
const BIRD_FLAP_POWER = -5; // 负值表示向上移动，数值越大跳跃越高

// 鸟的属性设置
const BIRD_WIDTH = 30;  // 鸟的宽度，根据实际精灵图调整，保持碰撞检测准确
const BIRD_HEIGHT = 24; // 鸟的高度，根据实际精灵图调整，保持碰撞检测准确

// 管道属性设置
const PIPE_WIDTH = 55;    // 管道宽度，根据实际精灵图调整
const PIPE_HOLE_MIN = 100; // 管道之间的最小垂直间隙，影响游戏难度
const PIPE_HOLE_MAX = 150; // 管道之间的最大垂直间隙，影响游戏难度
const PIPE_SPAWN_INTERVAL_MIN = 1500; // 毫秒，生成新管道的最小时间间隔
const PIPE_SPAWN_INTERVAL_MAX = 2500; // 毫秒，生成新管道的最大时间间隔

// 金币属性设置
const COIN_SIZE = 40;        // 圆形金币的直径，或方形金币的宽度/高度
const COIN_GOLD_VALUE = 2;   // 金币的分数值
const COIN_SILVER_VALUE = 1; // 银币的分数值
const COIN_SPAWN_CHANCE = 0.6; // 生成金币的概率（60%）

// 道具属性设置
const POWERUP_SIZE = 50;         // 道具的大小，设置较大以便于收集
const POWERUP_SPAWN_CHANCE = 0.5; // 生成道具的概率（50%）
const POWERUP_DURATION = 5000;    // 道具持续时间（5秒）
const SHIELD_SPEED_BOOST = 1.2;   // 护盾状态下速度提升20%
const MAGNET_RADIUS = 200;        // 磁铁吸引范围（像素）
const MAGNET_STRENGTH = 5;        // 磁铁吸引力度，影响金币被吸引的速度

// 新增特殊道具属性设置
const SMOKE_DURATION = 3000;       // 烟雾效果持续时间（3秒）
const BRANCH_SIZE = 45;            // 树枝道具的大小
const SMOKE_SIZE = 50;             // 烟雾道具的大小
const BRANCH_SPAWN_CHANCE = 0.15;  // 树枝生成基础概率（15%）
const SMOKE_SPAWN_CHANCE = 0.15;   // 烟雾生成基础概率（15%）

// 收集物生成概率设置（默认值，会被难度设置中的值覆盖）
const COLLECTIBLE_ONLY_CHANCE = 0.3;      // 只生成收集物而不生成管道的概率（30%）
const SECOND_COLLECTIBLE_CHANCE = 0.6;    // 生成第二个收集物的概率（60%）
const THIRD_COLLECTIBLE_CHANCE = 0.3;     // 生成第三个收集物的概率（30%）

// 难度设置 - 包含三个难度级别的具体参数
const DIFFICULTIES = {
    // 简单难度 - 适合新手玩家
    easy: {
        pipeSpeed: 1.0,              // 管道移动速度较慢
        //pipeVerticalMove: 0,         // 管道不会上下移动
        //pipeHorizontalGap: 250,      // 管道之间的水平间距较大
        pipeVerticalGapMin: 140,     // 管道垂直间隙最小值
        pipeVerticalGapMax: 180,     // 管道垂直间隙最大值
        birdFlapPower: -5.5,         // 跳跃力度较大，更容易控制
        gravity: 0.22,               // 重力较小
        pipeSpawnIntervalMin: 2500,  // 管道生成间隔较长
        pipeSpawnIntervalMax: 3500,
        initialPipeDelay: 100,      // 开局等待0.1秒再生成管道
        collectibleOnlyChance: 0.3,      // 简单模式下30%概率只生成收集物
        secondCollectibleChance: 0.7,    // 简单模式下70%概率生成第二个收集物
        thirdCollectibleChance: 0.4,     // 简单模式下40%概率生成第三个收集物
        branchSpawnChance: 0.05,         // 简单模式下5%概率生成树枝障碍物
        smokeSpawnChance: 0.05,          // 简单模式下5%概率生成烟雾道具
    },
    // 普通难度 - 适合熟练玩家
    normal: {
        pipeSpeed: 1.5,              // 中等管道速度
        //pipeVerticalMove: 0.5,       // 管道会缓慢上下移动
        //pipeVerticalMoveSpeed: 0.01, // 管道垂直移动速度
       // pipeHorizontalGap: 200,      // 中等管道间距
        pipeVerticalGapMin: PIPE_HOLE_MIN,
        pipeVerticalGapMax: PIPE_HOLE_MAX,
        birdFlapPower: BIRD_FLAP_POWER,
        gravity: GRAVITY,
        pipeSpawnIntervalMin: PIPE_SPAWN_INTERVAL_MIN,
        pipeSpawnIntervalMax: PIPE_SPAWN_INTERVAL_MAX,
        initialPipeDelay: 100,      // 开局等待0.1秒再生成管道
        collectibleOnlyChance: 0.3,      // 普通模式下30%概率只生成收集物
        secondCollectibleChance: 0.6,    // 普通模式下60%概率生成第二个收集物
        thirdCollectibleChance: 0.3,     // 普通模式下30%概率生成第三个收集物
        branchSpawnChance: 0.15,         // 普通模式下15%概率生成树枝障碍物
        smokeSpawnChance: 0.15,          // 普通模式下15%概率生成烟雾道具
    },
    // 困难难度 - 适合挑战玩家
    hard: {
        pipeSpeed: 1.8,              // 管道移动速度快
        //pipeVerticalMove: 1.0,       // 管道上下移动幅度大
        //pipeVerticalMoveSpeed: 0.02, // 管道垂直移动速度快
        //pipeHorizontalGap: 250,      // 管道间距较小
        pipeVerticalGapMin: 90,      // 管道垂直间隙小
        pipeVerticalGapMax: 120,
        birdFlapPower: -4.5,         // 跳跃力度小，难以控制
        gravity: 0.28,               // 重力大
        pipeSpawnIntervalMin: 1000,  // 管道生成间隔短
        pipeSpawnIntervalMax: 2000,
        initialPipeDelay: 100,      // 开局等待0.1秒再生成管道
        collectibleOnlyChance: 0.3,      // 困难模式下30%概率只生成收集物
        secondCollectibleChance: 0.7,    // 困难模式下70%概率生成第二个收集物
        thirdCollectibleChance: 0.5,     // 困难模式下50%概率生成第三个收集物
        branchSpawnChance: 0.35,         // 困难模式下35%概率生成树枝障碍物
        smokeSpawnChance: 0.25,          // 困难模式下25%概率生成烟雾道具
    }
};

// 游戏状态枚举
const GAME_STATE = {
    MENU: 'MENU',               // 主菜单状态
    DIFFICULTY_SELECT: 'DIFFICULTY_SELECT', // 难度选择状态
    PLAYING: 'PLAYING',         // 游戏进行中状态
    GAME_OVER: 'GAME_OVER',    // 游戏结束状态
    PAUSED: 'PAUSED'           // 游戏暂停状态
};

// 游戏资源路径配置
const ASSETS = {
    // 游戏基础图片资源
    pipeTop: 'assets/pipe.png',
    background: 'assets/background.png',
    
    // 道具图片资源
    powerupShield: 'assets/powerup_shield.png',
    powerupMagnet: 'assets/powerup_magnet.png',
    powerupDoubleScore: 'assets/powerup_doublescore.png',
    
    // 新增特殊道具图片资源
    powerupBranch: 'assets/powerup_branch.png',   // 树枝障碍物图片
    powerupSmoke: 'assets/powerup_smoke.png',     // 烟雾道具图片
    smokeOverlay: 'assets/smoke_overlay.png',     // 烟雾遮罩图片
    
    // 小鸟动画帧
    bird1: './assets/bird1.png',
    bird2: './assets/bird2.png',
    bird3: './assets/bird3.png',
    
    // 音效资源
    fly: 'assets/fly.wav',
    crash: 'assets/crash.wav',
    
    // 数字图片（用于显示分数）
    n0: 'assets/n0.png',
    n1: 'assets/n1.png',
    n2: 'assets/n2.png',
    n3: 'assets/n3.png',
    n4: 'assets/n4.png',
    n5: 'assets/n5.png',
    n6: 'assets/n6.png',
    n7: 'assets/n7.png',
    n8: 'assets/n8.png',
    n9: 'assets/n9.png',
    
    // 金币图片
    coinGold: './assets/coin_gold.png',
    coinSilver: './assets/coin_silver.png',
    
    // UI界面图片
    tapToStart: './assets/Tap.png',  // 点击开始提示
    pause: './assets/pause.png',     // 暂停按钮
    ready: './assets/ready.png',     // 准备提示
    start: './assets/start.png',     // 开始按钮
    title: './assets/title.png',     // 游戏标题图片
    btnEasy: './assets/btn_easy.png',      // 简单难度按钮
    btnNormal: './assets/btn_normal.png',  // 普通难度按钮
    btnHard: './assets/btn_hard.png',      // 困难难度按钮
    btnStart: './assets/btn_start.png',    // 新的开始游戏按钮
};

// 得分显示相关配置
const SCORE_NUMBERS = ['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9']; // 分数显示用的数字图片
const SCORE_NUMBER_WIDTH = 24;   // 数字图片的宽度
const SCORE_NUMBER_HEIGHT = 36;  // 数字图片的高度
const SCORE_PADDING = 2;        // 数字之间的间距
const SCORE_Y_POSITION = 50;    // 分数显示距离顶部的距离

// 动画相关配置
const BIRD_ANIMATION_SPEED = 100; // 小鸟动画每帧持续时间（毫秒）

// 小鸟动画帧配置
const BIRD_FRAMES = ['bird1', 'bird2', 'bird3']; // 小鸟动画使用的帧序列

// 帮助提示图片尺寸配置
const HELP_IMAGE_WIDTH = 100;   // 帮助提示图片宽度
const HELP_IMAGE_HEIGHT = 100;  // 帮助提示图片高度

