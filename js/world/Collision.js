class Collision {
  constructor() {
    this.walls = [];
    DEBUG.world.log('Collision system initialized');
  }

  addWall(wall) {
    this.walls.push(wall);
  }

  checkCollision(position, radius = 0.4) {
    // Проверка валидности позиции
    if (!DEBUG.validate(position, 'position', 'PHYSICS')) return false;
    
    // Предупреждение если массив стен пуст
    if (this.walls.length === 0) {
      DEBUG.world.warn('checkCollision: нет стен для проверки коллизий');
      return false;
    }
    
    for (const w of this.walls) {
      if (position.x + radius > w.minX && position.x - radius < w.maxX &&
        position.z + radius > w.minZ && position.z - radius < w.maxZ &&
        position.y > w.minY && position.y - 1.7 < w.maxY) {
        DEBUG.physics.trace('Коллизия обнаружена', { pos: position, wall: w });
        return true;
      }
    }
    return false;
  }

  checkEnemyCollision(position, size) {
    // Проверка валидности позиции
    if (!DEBUG.validate(position, 'enemyPosition', 'PHYSICS')) return false;
    
    const r = size * 0.5;
    for (const w of this.walls) {
      if (position.x + r > w.minX && position.x - r < w.maxX &&
        position.z + r > w.minZ && position.z - r < w.maxZ &&
        position.y > w.minY - 1 && position.y - 1 < w.maxY) {
        DEBUG.physics.trace('Коллизия врага обнаружена', { pos: position, size });
        return true;
      }
    }
    return false;
  }

  hasLineOfSight(from, to) {
    // Проверка валидности точек
    if (!DEBUG.validate(from, 'from', 'PHYSICS') || !DEBUG.validate(to, 'to', 'PHYSICS')) {
      return false;
    }
    
    const dir = to.clone().sub(from).normalize();
    const dist = from.distanceTo(to);
    const steps = Math.ceil(dist / 2);

    DEBUG.physics.trace('Проверка линии видимости', { from, to, dist, steps });

    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * dist;
      const pos = from.clone().add(dir.clone().multiplyScalar(t));
      if (this.checkCollision(pos)) {
        DEBUG.physics.trace('Линия видимости заблокирована', { pos });
        return false;
      }
    }
    DEBUG.physics.trace('Линия видимости чиста');
    return true;
  }
}
