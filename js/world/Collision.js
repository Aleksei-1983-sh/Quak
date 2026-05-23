class Collision {
  constructor() {
    this.walls = [];
  }

  addWall(wall) {
    this.walls.push(wall);
  }

  checkCollision(position, radius = 0.4) {
    for (const w of this.walls) {
      if (position.x + radius > w.minX && position.x - radius < w.maxX &&
        position.z + radius > w.minZ && position.z - radius < w.maxZ &&
        position.y > w.minY && position.y - 1.7 < w.maxY) {
        return true;
      }
    }
    return false;
  }

  checkEnemyCollision(position, size) {
    const r = size * 0.5;
    for (const w of this.walls) {
      if (position.x + r > w.minX && position.x - r < w.maxX &&
        position.z + r > w.minZ && position.z - r < w.maxZ &&
        position.y > w.minY - 1 && position.y - 1 < w.maxY) {
        return true;
      }
    }
    return false;
  }

  hasLineOfSight(from, to) {
    const dir = to.clone().sub(from).normalize();
    const dist = from.distanceTo(to);
    const steps = Math.ceil(dist / 2);

    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * dist;
      const pos = from.clone().add(dir.clone().multiplyScalar(t));
      if (this.checkCollision(pos)) return false;
    }
    return true;
  }
}
