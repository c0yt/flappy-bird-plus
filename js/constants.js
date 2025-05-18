// js/constants.js

// Canvas dimensions
const CANVAS_WIDTH = 320; // Typical width for pixel art games
const CANVAS_HEIGHT = 480; // Typical height for portrait mobile games

// Game physics
const GRAVITY = 0.25;
const BIRD_FLAP_POWER = -5; // Negative value for upward movement

// Bird properties
const BIRD_WIDTH = 30; // Example width, adjust with actual sprite
const BIRD_HEIGHT = 24; // Example height, adjust with actual sprite

// Pipe properties
const PIPE_WIDTH = 55; // Example width, adjust with actual sprite
const PIPE_HOLE_MIN = 100; // Minimum vertical gap between pipes
const PIPE_HOLE_MAX = 150; // Maximum vertical gap between pipes
const PIPE_SPAWN_INTERVAL_MIN = 1500; // ms, min time between new pipe spawns
const PIPE_SPAWN_INTERVAL_MAX = 2500; // ms, max time between new pipe spawns

// Coin properties
const COIN_SIZE = 40; // Diameter for a round coin, or width/height for square
const COIN_GOLD_VALUE = 2;
const COIN_SILVER_VALUE = 1;
const COIN_SPAWN_CHANCE = 0.6; // 提高到80%的概率生成金币

// Power-up properties
const POWERUP_SIZE = 50; // 原来是24，改为36使其更容易看见和收集
const POWERUP_SPAWN_CHANCE = 0.5; // 10% chance to spawn instead of a coin
const POWERUP_DURATION = 5000; // 5 seconds for most power-ups
const SHIELD_SPEED_BOOST = 1.2; // 20% speed boost with shield
const MAGNET_RADIUS = 200; // Pixels
const MAGNET_STRENGTH = 5; // 增加磁铁吸引力

// Difficulty settings
const DIFFICULTIES = {
    easy: {
        pipeSpeed: 1.5,
        pipeVerticalMove: 0,      // Pipes are static vertically
        pipeHorizontalGap: 250,   // Wider gap between pipe sets
        pipeVerticalGapMin: 140,
        pipeVerticalGapMax: 180,
        birdFlapPower: -5.5,      // Slightly stronger flap
        gravity: 0.22,
        pipeSpawnIntervalMin: 2500,  // 更长的生成间隔
        pipeSpawnIntervalMax: 3500,
        initialPipeDelay: 1500,    // 开局等待3秒再生成管道
    },
    normal: {
        pipeSpeed: 2.0,
        pipeVerticalMove: 0.5,    // Slow vertical movement amplitude
        pipeVerticalMoveSpeed: 0.01, // Speed of vertical oscillation
        pipeHorizontalGap: 200,
        pipeVerticalGapMin: PIPE_HOLE_MIN,
        pipeVerticalGapMax: PIPE_HOLE_MAX,
        birdFlapPower: BIRD_FLAP_POWER,
        gravity: GRAVITY,
        pipeSpawnIntervalMin: PIPE_SPAWN_INTERVAL_MIN,
        pipeSpawnIntervalMax: PIPE_SPAWN_INTERVAL_MAX,
        initialPipeDelay: 1000,    // 开局等待2秒再生成管道
    },
    hard: {
        pipeSpeed: 2.8,
        pipeVerticalMove: 1.0,    // Faster vertical movement amplitude
        pipeVerticalMoveSpeed: 0.02,
        pipeHorizontalGap: 250,   // Narrower gap
        pipeVerticalGapMin: 90,
        pipeVerticalGapMax: 120,
        birdFlapPower: -4.5,      // Weaker flap, harder to control
        gravity: 0.28,
        pipeSpawnIntervalMin: 1000,  // 更短的生成间隔
        pipeSpawnIntervalMax: 2000,
        initialPipeDelay: 1500,    // 开局等待1.5秒再生成管道
    }
};

// Game States
const GAME_STATE = {
    MENU: 'MENU',
    DIFFICULTY_SELECT: 'DIFFICULTY_SELECT',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER',
    PAUSED: 'PAUSED'
};

// Asset paths (placeholders, update with actual paths/names)
const ASSETS = {
    pipeTop: 'assets/pipe.png',
    background: 'assets/background.png',
    powerupShield: 'assets/powerup_shield.png',
    powerupMagnet: 'assets/powerup_magnet.png',
    powerupDoubleScore: 'assets/powerup_doublescore.png',
    bird1: './assets/bird1.png',
    bird2: './assets/bird2.png',
    bird3: './assets/bird3.png',
    fly: 'assets/fly.wav',
    crash: 'assets/crash.wav',
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
    coinGold: './assets/coin_gold.png',   // 添加相对路径
    coinSilver: './assets/coin_silver.png',
    tapToStart: './assets/Tap.png',  // 添加点击开始提示图片
    pause: './assets/pause.png',     // 添加暂停按钮图片
    ready: './assets/ready.png',     // 添加准备图片
    start: './assets/start.png',     // 添加开始按钮图片
};

// 添加得分显示相关常量
const SCORE_NUMBERS = ['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'];
const SCORE_NUMBER_WIDTH = 24;  // 数字图片的宽度
const SCORE_NUMBER_HEIGHT = 36; // 数字图片的高度
const SCORE_PADDING = 2;       // 数字之间的间距
const SCORE_Y_POSITION = 50;   // 距离顶部的距离

// 添加动画相关常量
const BIRD_ANIMATION_SPEED = 100; // 每帧动画持续时间（毫秒）

// 添加鸟的动画帧配置
const BIRD_FRAMES = ['bird1', 'bird2', 'bird3'];

// 添加帮助提示相关常量
const HELP_IMAGE_WIDTH = 100;  // 增加宽度
const HELP_IMAGE_HEIGHT = 100; // 增加高度

