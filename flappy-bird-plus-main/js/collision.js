// js/collision.js

function checkCollision(rect1, rect2) {
    // rect = { x, y, width, height }
    if (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y) {
        return true; // Collision detected
    }
    return false; // No collision
}

// Specific collision checks can be added here if needed, e.g., pixel-perfect for rotated objects
// For this game, AABB (Axis-Aligned Bounding Box) is likely sufficient.

