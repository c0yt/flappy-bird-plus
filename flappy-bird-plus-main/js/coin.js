// js/coin.js

class Coin {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = COIN_SIZE;
        this.type = type; // 'gold' or 'silver'
        this.value = (type === 'gold') ? COIN_GOLD_VALUE : COIN_SILVER_VALUE;
        this.image = new Image();
        this.image.src = (type === 'gold') ? ASSETS.coinGold : ASSETS.coinSilver;
        this.collected = false;
        this.speed = game.currentDifficultySettings.pipeSpeed || 2;  // 设置初始速度
    }

    update(deltaTime) {
        // 使用传入的speed属性移动
        this.x -= this.speed;
    }

    draw(ctx) {
        if (this.collected) return;

        if (this.image.complete) {
            ctx.drawImage(this.image, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        } else {
            ctx.fillStyle = (this.type === 'gold') ? 'gold' : 'silver';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
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

