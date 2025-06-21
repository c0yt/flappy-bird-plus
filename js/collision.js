// js/collision.js - 碰撞检测工具文件

function checkCollision(rect1, rect2) {
    // 使用AABB（轴对齐包围盒）碰撞检测算法
    // 当两个矩形在x轴和y轴上都有重叠时，判定为发生碰撞
    if (rect1.x < rect2.x + rect2.width &&   // rect1的左边在rect2的右边的左侧
        rect1.x + rect1.width > rect2.x &&   // rect1的右边在rect2的左边的右侧
        rect1.y < rect2.y + rect2.height &&  // rect1的上边在rect2的下边的上侧
        rect1.y + rect1.height > rect2.y) {  // rect1的下边在rect2的上边的下侧
        return true; // 检测到碰撞
    }
    return false; // 没有碰撞
}

// 注：目前使用简单的AABB碰撞检测已经足够
// 如果需要更精确的碰撞检测（如旋转物体的碰撞），可以在此添加更复杂的检测算法

