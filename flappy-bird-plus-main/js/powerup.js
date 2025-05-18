// js/powerup.js

class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = POWERUP_SIZE;
        this.type = type; // e.g., 'shield', 'magnet', 'doubleScore'
        this.image = new Image();
        this.collected = false;
        this.duration = POWERUP_DURATION;
        this.speed = game.currentDifficultySettings.pipeSpeed || 2;  // 设置初始速度

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
                this.image.src = ''; // Or a generic powerup image
        }
    }

    update(deltaTime) {
        // 使用传入的speed属性移动
        this.x -= this.speed;
    }

    draw(ctx) {
        if (this.collected) return;

        if (this.image.complete && this.image.src) {
            ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        } else {
            // Fallback drawing
            ctx.fillStyle = 'purple'; // Generic powerup color
            if (this.type === 'shield') ctx.fillStyle = 'aqua';
            if (this.type === 'magnet') ctx.fillStyle = 'pink';
            if (this.type === 'doubleScore') ctx.fillStyle = 'orange';
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }
    }

    activate() {
        this.collected = true;
        switch (this.type) {
            case 'shield':
                this.game.bird.activateShield(this.duration);
                this.game.currentSpeedMultiplier = SHIELD_SPEED_BOOST; // Game speed increases
                break;
            case 'magnet':
                this.game.activateMagnet(this.duration);
                break;
            case 'doubleScore':
                this.game.activateDoubleScore(this.duration);
                break;
        }
    }

    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }

    isOffscreen() {
        return this.x + this.size < 0;
    }
}

