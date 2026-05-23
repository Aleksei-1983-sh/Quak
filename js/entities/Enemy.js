const ENEMY_TYPES = {
  grunt: { hp: 60, speed: 2.5, damage: 8, range: 15, color: 0x884422, size: 0.6, score: 100 },
  soldier: { hp: 100, speed: 2, damage: 15, range: 25, color: 0x446644, size: 0.7, score: 150 },
  boss: { hp: 300, speed: 1.5, damage: 25, range: 20, color: 0x880000, size: 1.0, score: 500 }
};

class Enemy {
  constructor(x, z, type, game) {
    this.game = game;
    const def = ENEMY_TYPES[type];

    this.position = new THREE.Vector3(x, def.size * 0.8, z);
    this.health = def.hp;
    this.maxHealth = def.hp;
    this.speed = def.speed;
    this.damage = def.damage;
    this.range = def.range;
    this.color = def.color;
    this.size = def.size;
    this.score = def.score;
    this.type = type;
    this.state = 'patrol';
    this.attackTimer = 0;
    this.patrolTarget = new THREE.Vector3(
      x + (Math.random() - 0.5) * 10,
      def.size * 0.8,
      z + (Math.random() - 0.5) * 10
    );
    this.deathTimer = 0;
    this.hitFlash = 0;

    this.createMesh();
  }

  createMesh() {
    const def = ENEMY_TYPES[this.type];
    const geo = new THREE.BoxGeometry(def.size, def.size * 2, def.size);
    const mat = new THREE.MeshLambertMaterial({ color: def.color });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    this.game.scene.add(this.mesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(def.size * 0.15, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-def.size * 0.25, def.size * 0.5, -def.size * 0.5);
    this.mesh.add(eye1);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye2.position.set(def.size * 0.25, def.size * 0.5, -def.size * 0.5);
    this.mesh.add(eye2);

    // Health bar
    const hbGeo = new THREE.PlaneGeometry(def.size * 1.5, 0.08);
    const hbMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    this.healthBar = new THREE.Mesh(hbGeo, hbMat);
    this.healthBar.position.y = def.size + 0.2;
    this.mesh.add(this.healthBar);
  }

  update(dt) {
    DEBUG.entity.trace('Enemy update start', { type: this.type, state: this.state, pos: this.position });
    
    if (this.state === 'dead') {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.mesh.visible = false;
        DEBUG.entity.log('Труп врага скрыт');
      }
      return;
    }

    // Hit flash
    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
      if (this.hitFlash <= 0) {
        this.mesh.material.color.setHex(this.color);
      } else {
        this.mesh.material.color.setHex(0xffffff);
      }
    }

    const player = this.game.player;
    const toPlayer = player.position.clone().sub(this.position);
    const dist = toPlayer.length();
    // --- ДОБАВИТЬ ЭТОТ БЛОК ---
    // Защита от NaN: если игрок находится прямо внутри врага, не вычисляем вектор
    if (dist < 0.1) {
        DEBUG.entity.warn('Игрок слишком близко к врагу, пропускаем вычисления', { dist });
        this.mesh.position.copy(this.position);
        return; 
    }
    // --------------------------
    const canSee = dist < 30 && this.game.collision.hasLineOfSight(this.position, player.position);

    // State machine
    if (canSee && dist < 25) {
      const oldState = this.state;
      this.state = dist < this.range ? 'attack' : 'chase';
      if (oldState !== this.state) {
        DEBUG.entity.info(`Смена состояния врага: ${oldState} -> ${this.state}`, { type: this.type });
      }
    } else if (canSee) {
      this.state = 'chase';
    } else {
      this.state = 'patrol';
    }

    // Face player
    if (canSee) {
      this.mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
    }

    this.handleState(dt, toPlayer, dist);

    // Bounds
    const oldX = this.position.x;
    const oldZ = this.position.z;
    this.position.x = Math.max(-29, Math.min(29, this.position.x));
    this.position.z = Math.max(-29, Math.min(29, this.position.z));
    
    // Логирование если позиция была обрезана границами
    if (oldX !== this.position.x || oldZ !== this.position.z) {
      DEBUG.world.warn('Враг уперся в границу карты', { pos: this.position, type: this.type });
    }

    // Update mesh
    this.mesh.position.copy(this.position);
    this.mesh.position.y += Math.sin(Date.now() * 0.003 + this.position.x) * 0.002;
    
    DEBUG.entity.trace('Enemy update end', { pos: this.position, state: this.state });
  }

  handleState(dt, toPlayer, dist) {
    switch (this.state) {
      case 'patrol': {
        const toTarget = this.patrolTarget.clone().sub(this.position);
        if (toTarget.length() < 1) {
          this.patrolTarget.set(
            this.position.x + (Math.random() - 0.5) * 15,
            this.size * 0.8,
            this.position.z + (Math.random() - 0.5) * 15
          );
        }
        toTarget.normalize().multiplyScalar(this.speed * 0.5 * dt);
        this.position.add(toTarget);
        break;
      }
      case 'chase': {
        const dir = toPlayer.normalize().multiplyScalar(this.speed * dt);
        const newPos = this.position.clone().add(dir);
        if (!this.game.collision.checkEnemyCollision(newPos, this.size)) {
          this.position.add(dir);
        }
        break;
      }
      case 'attack': {
        this.attackTimer -= dt;
        if (this.attackTimer <= 0 && dist < this.range * 1.5) {
          this.attackTimer = 1.5;
          this.game.player.takeDamage(this.damage);
        }
        break;
      }
    }
  }

  takeDamage(damage) {
    DEBUG.entity.info('Враг получает урон', { type: this.type, damage, health: this.health });
    
    this.health -= damage;
    this.hitFlash = 0.15;

    if (this.health <= 0 && this.state !== 'dead') {
      DEBUG.entity.info(`Враг ${this.type} уничтожен!`, { score: this.score });
      this.state = 'dead';
      this.deathTimer = 2;
      this.game.enemiesKilled++;
      this.game.score += this.score;
      this.game.audio.play('enemy_die');
      this.game.hud.showKillFeed(this.type, this.score);

      this.game.props.spawnParticles(this.position.clone(), this.color, 20);
      this.mesh.material.color.setHex(0xff0000);
    }

    // Update health bar
    if (this.healthBar) {
      const pct = Math.max(0, this.health / this.maxHealth);
      this.healthBar.scale.x = pct;
      DEBUG.entity.trace(`HP бар врага: ${(pct * 100).toFixed(0)}%`);
    }

    this.game.hud.update();
  }
}
