class GameEngine {
  constructor() {
    DEBUG.core.info('=== Инициализация GameEngine ===');
    this.audio = new AudioSystem();
    DEBUG.core.log('AudioSystem создан');
    this.input = new InputManager();
    DEBUG.core.log('InputManager создан');
    this.running = false;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTime = 0;

    this.score = 0;
    this.currentWeapon = 0;
    this.fireTimer = 0;
    this.weaponBob = 0;
    this.reloading = false;
    this.reloadTimer = 0;
    this.enemiesKilled = 0;
    this.totalEnemies = 0;
    this.levelComplete = false;
    this._wasFiring = false;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.weaponGroup = null;
    this.weaponMesh = null;
    this.gunLight = null;

    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles = [];
    this.walls = [];

    this.renderer3d = null;
    this.level = null;
    this.collision = null;
    this.props = null;
    this.hud = null;
    this.postFX = null;

    DEBUG.core.info('GameEngine создан, вызываем init()');
    this.init();
  }

  init() {
    DEBUG.core.info('=== Запуск init() ===');
    this.renderer3d = new Renderer();
    DEBUG.render.log('Renderer создан');
    this.scene = this.renderer3d.scene;
    this.camera = this.renderer3d.camera;
    this.renderer = this.renderer3d.renderer;

    this.collision = new Collision();
    DEBUG.world.log('Collision создан');
    this.walls = this.collision.walls;

    this.postFX = new PostProcessing();
    DEBUG.render.log('PostProcessing создан');
    this.hud = new HUD(this);
    DEBUG.ui.log('HUD создан');
    this.props = new Props(this);
    DEBUG.world.log('Props создан');

    this.player = new Player(this);
    DEBUG.entity.info('Player создан', { pos: this.player.position });
    this.createWeaponModel();
    DEBUG.render.log('Оружие создано');
    this.level = new Level(this);
    DEBUG.world.info('Level создан', { rows: this.level.rows, cols: this.level.cols });
    this.spawnEnemies();
    DEBUG.entity.info(`Враги заспавлены: ${this.totalEnemies}`);
    this.spawnPickups();
    DEBUG.world.log(`Pickups заспавлены: ${this.pickups.length}`);

    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('keydown', e => this.onKeyDown(e));
    DEBUG.input.log('Слушатели событий добавлены');

    this.audio.play('ambient');
    DEBUG.audio.log('Ambient звук запущен');
    DEBUG.core.info('=== init() завершен ===');
  }

  createWeaponModel() {
    this.weaponGroup = new THREE.Group();

    const gunGeo = new THREE.BoxGeometry(0.08, 0.12, 0.5);
    const gunMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    this.weaponMesh = new THREE.Mesh(gunGeo, gunMat);
    this.weaponMesh.position.set(0.25, -0.2, -0.4);
    this.weaponGroup.add(this.weaponMesh);

    const barrelGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.3, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.15, -0.7);
    this.weaponGroup.add(barrel);

    this.gunLight = new THREE.PointLight(0xff6600, 0.3, 2);
    this.gunLight.position.set(0.25, -0.1, -0.5);
    this.weaponGroup.add(this.gunLight);

    this.camera.add(this.weaponGroup);
    this.scene.add(this.camera);
  }

  spawnEnemies() {
    const positions = [
      { x: -15, z: -15, type: 'soldier' },
      { x: 15, z: -15, type: 'soldier' },
      { x: -15, z: 15, type: 'grunt' },
      { x: 15, z: 15, type: 'grunt' },
      { x: -5, z: -12, type: 'grunt' },
      { x: 5, z: 12, type: 'grunt' },
      { x: -20, z: 0, type: 'soldier' },
      { x: 20, z: 0, type: 'soldier' },
      { x: 0, z: -20, type: 'boss' },
      { x: -10, z: 5, type: 'grunt' },
      { x: 10, z: -5, type: 'grunt' },
      { x: -22, z: -22, type: 'soldier' },
      { x: 22, z: 22, type: 'soldier' },
      { x: 0, z: 20, type: 'boss' }
    ];

    positions.forEach(p => {
      const enemy = new Enemy(p.x, p.z, p.type, this);
      this.enemies.push(enemy);
      this.totalEnemies++;
    });
  }

  spawnPickups() {
    const pickupPositions = [
      { x: -10, z: 0, type: 'health' },
      { x: 10, z: 0, type: 'health' },
      { x: 0, z: -10, type: 'armor' },
      { x: 0, z: 10, type: 'armor' },
      { x: -20, z: 10, type: 'ammo' },
      { x: 20, z: -10, type: 'ammo' },
      { x: -18, z: -18, type: 'health' },
      { x: 18, z: 18, type: 'ammo' },
      { x: 5, z: 5, type: 'health' },
      { x: -5, z: -5, type: 'ammo' }
    ];

    const colors = { health: 0x00ff44, armor: 0x4488ff, ammo: 0xffaa00 };

    pickupPositions.forEach(p => {
      const geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      const mat = new THREE.MeshBasicMaterial({ color: colors[p.type] });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, 0.5, p.z);

      const glowGeo = new THREE.SphereGeometry(0.5, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: colors[p.type], transparent: true, opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      mesh.add(glow);

      this.scene.add(mesh);

      this.pickups.push({
        position: new THREE.Vector3(p.x, 0.5, p.z),
        type: p.type,
        mesh: mesh,
        active: true
      });
    });
  }

  onKeyDown(e) {
    if (e.code === 'Digit1') this.switchWeapon(0);
    if (e.code === 'Digit2') this.switchWeapon(1);
    if (e.code === 'Digit3') this.switchWeapon(2);
    if (e.code === 'KeyR') this.reload();

    if (e.code === 'KeyG') { // <--- ДОБАВИТЬ ЭТОТ БЛОК
      this.player.godMode = !this.player.godMode;
      console.log(`Год Mode: ${this.player.godMode}`);
    }
  }

  switchWeapon(idx) {
    if (idx === this.currentWeapon || idx >= this.player.weapons.length) return;
    this.currentWeapon = idx;
    this.reloading = false;
    this.hud.update();

    const colors = [0x334433, 0x444444, 0x553322];
    if (this.weaponMesh) this.weaponMesh.material.color.setHex(colors[idx]);

    const wn = document.getElementById('weapon-name');
    wn.textContent = this.player.weapons[idx].name;
    wn.style.opacity = 1;
    setTimeout(() => wn.style.opacity = 0, 1500);
  }

  reload() {
    const w = this.player.weapons[this.currentWeapon];
    if (w.ammo >= w.maxAmmo || this.reloading) return;
    this.reloading = true;
    this.reloadTimer = 1.5;
  }

  update(dt) {
    if (!this.running) return;

    DEBUG.core.trace('update() start', { dt, fps: this.fps });

    this.frameCount++;
    this.fpsTime += dt;
    if (this.fpsTime >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = 0;
      document.getElementById('fps').textContent = `${this.fps} FPS`;
      DEBUG.perf.log(`FPS: ${this.fps}`);
    }

    this.player.update(dt);
    this.updateShooting(dt);

    if (this.reloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        const w = this.player.weapons[this.currentWeapon];
        w.ammo = w.maxAmmo;
        this.reloading = false;
        DEBUG.combat.info('Перезарядка завершена');
        this.hud.update();
      }
    }

    this.enemies.forEach(e => e.update(dt));
    this.updateProjectiles(dt);
    this.props.updateParticles(dt);
    this.updatePickups(dt);

    const moving = this.input.isPressed('KeyW') || this.input.isPressed('KeyS') ||
                   this.input.isPressed('KeyA') || this.input.isPressed('KeyD');
    if (moving && this.player.onGround) {
      this.weaponBob += dt * (this.player.sprinting ? 12 : 8);
    } else {
      this.weaponBob *= 0.9;
    }

    if (this.weaponGroup) {
      const bobX = Math.sin(this.weaponBob) * 0.015;
      const bobY = Math.cos(this.weaponBob * 2) * 0.01;
      this.weaponGroup.position.set(bobX, bobY, 0);

      if (this.fireTimer > 0) {
        this.weaponGroup.position.z = -this.fireTimer * 0.1;
      } else {
        this.weaponGroup.position.z *= 0.8;
      }

      if (this.reloading) {
        this.weaponGroup.rotation.x = -0.3 * Math.sin(this.reloadTimer * Math.PI);
      } else {
        this.weaponGroup.rotation.x *= 0.9;
      }
    }

    if (this.enemiesKilled >= this.totalEnemies && !this.levelComplete) {
      this.levelComplete = true;
      const msg = document.getElementById('level-msg');
      msg.textContent = 'SECTOR CLEARED';
      msg.style.opacity = 1;
      DEBUG.ui.info('Уровень завершен!');
      setTimeout(() => msg.style.opacity = 0, 3000);
    }

    // Обновление отладочной панели
    if (this.input.isPressed('F2') && this.level) {
      const p = this.player;
      const debug = document.getElementById('debug-content');
      debug.innerHTML = `
        POS: ${p.position.x.toFixed(1)}, ${p.position.z.toFixed(1)}<br>
        MAP: ${this.level.rows}x${this.level.cols} tiles<br>
        WALLS: ${this.walls.length}<br>
        ENEMIES: ${this.enemies.length}/${this.totalEnemies}<br>
        FPS: ${this.fps}
      `;
    }

    DEBUG.core.trace('update() end');
  }

  updateShooting(dt) {
    const w = this.player.weapons[this.currentWeapon];
    
    // Проверка валидности оружия
    if (!DEBUG.validate(w, 'currentWeapon', 'COMBAT')) return;
    
    if (this.fireTimer > 0) { 
      this.fireTimer -= dt; 
      return; 
    }
    
    if (this.input.mouse.left && w.ammo > 0 && !this.reloading) {
      if (w.auto || !this._wasFiring) {
        DEBUG.combat.trace('Выстрел', { weapon: w.name, ammo: w.ammo });
        this.fireWeapon(w);
        this.fireTimer = w.fireRate;
        w.ammo--;
        this.hud.update();
      }
    }
    this._wasFiring = this.input.mouse.left;
  }

  fireWeapon(w) {
    this.audio.play(w.sound);

    const mf = document.getElementById('muzzle-flash');
    mf.style.opacity = 1;
    setTimeout(() => mf.style.opacity = 0, 50);

    if (this.gunLight) {
      this.gunLight.intensity = 3;
      setTimeout(() => { if (this.gunLight) this.gunLight.intensity = 0.3; }, 80);
    }

    if (w.type === 'ray' || w.type === 'ray_multi') {
      const pellets = w.pellets || 1;
      for (let i = 0; i < pellets; i++) {
        this.raycastShot(w.damage, w.spread, w.color);
      }
    } else if (w.type === 'projectile') {
      this.fireRocket(w);
    }
  }

  raycastShot(damage, spread, color) {
    DEBUG.combat.trace('raycastShot start', { damage, spread, color });
    
    // 1. Создаем направление стрельбы (с разбросом)
    // Проверка: если вектор нулевой, не нормализуем его (это вызывает NaN)
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      -1
    );
    
    if (dir.lengthSq() === 0) {
      DEBUG.combat.warn('raycastShot: нулевой вектор направления');
      return; // Страховка от ошибки
    }
    dir.normalize().applyQuaternion(this.camera.quaternion);

    let closestHit = null;
    let closestDist = Infinity;

    this.enemies.forEach(enemy => {
      if (enemy.state === 'dead') return;
      
      const toEnemy = enemy.position.clone().sub(this.camera.position);
      const dist = toEnemy.length(); // Вычисляем реальное расстояние

      // Если враг слишком близко (внутри игрока) или в невидимой зоне, пропускаем
      if (dist < 0.1 || dist > 100) return; 
      
      const dirToEnemy = toEnemy.clone().normalize();

      // Математика перпендикуляра (проверка, попали ли в хитбокс)
      const perpDist = this.camera.position.clone()
        .add(dir.clone().multiplyScalar(toEnemy.dot(dir)))
        .sub(enemy.position).length();

      // Проверка попадания: в радиусе врага и перед камерой
      if (perpDist < enemy.size && toEnemy.dot(dir) > 0 && dist < closestDist) {
        closestDist = dist;
        closestHit = enemy;
        DEBUG.combat.trace('Потенциальное попадание', { enemy: enemy.type, dist });
      }
    });

    // Если попали
    if (closestHit) {
      DEBUG.combat.info('Попадание во врага!', { enemy: closestHit.type, damage, dist: closestDist });
      closestHit.takeDamage(damage);
      this.audio.play('hit');
      this.showHitMarker();
      this.props.spawnParticles(closestHit.position.clone(), 0xff0000, 5);
    } else {
      DEBUG.combat.trace('Промах');
    }

    // Создаем трассер
    // Если цели не найдено, рисуем луч на стандартное расстояние (100)
    const tracerDist = closestHit ? closestDist : 100;
    this.props.spawnTracer(this.camera.position.clone(), dir, tracerDist, color);
  }

  fireRocket(w) {
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * w.spread,
      (Math.random() - 0.5) * w.spread,
      -1
    ).normalize().applyQuaternion(this.camera.quaternion);

    const rocket = {
      position: this.camera.position.clone().add(dir.clone().multiplyScalar(1)),
      velocity: dir.clone().multiplyScalar(30),
      damage: w.damage,
      life: 3,
      trail: []
    };

    const geo = new THREE.SphereGeometry(0.15, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(rocket.position);
    this.scene.add(mesh);
    rocket.mesh = mesh;

    const light = new THREE.PointLight(0xff4400, 1, 8);
    mesh.add(light);

    this.projectiles.push(rocket);
  }

  updateProjectiles(dt) {
    DEBUG.physics.trace('updateProjectiles start', { count: this.projectiles.length });
    
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      
      // Проверка валидности снаряда
      if (!DEBUG.validate(proj, `projectile[${i}]`, 'PHYSICS')) {
        this.projectiles.splice(i, 1);
        continue;
      }
      
      proj.life -= dt;
      if (proj.life <= 0) { 
        DEBUG.physics.trace('Снаряд уничтожен по времени жизни');
        this.explodeProjectile(proj); 
        continue; 
      }

      proj.position.add(proj.velocity.clone().multiplyScalar(dt));
      proj.mesh.position.copy(proj.position);

      if (this.collision.checkCollision(proj.position, 0.3)) {
        DEBUG.physics.info('Снаряд попал в стену');
        this.explodeProjectile(proj);
        continue;
      }

      let hit = false;
      this.enemies.forEach(enemy => {
        if (enemy.state === 'dead' || hit) return;
        if (proj.position.distanceTo(enemy.position) < enemy.size + 0.3) {
          DEBUG.combat.info('Снаряд попал во врага', { enemy: enemy.type });
          this.explodeProjectile(proj);
          enemy.takeDamage(proj.damage);
          hit = true;
        }
      });
    }

    this.projectiles = this.projectiles.filter(p => p.life > 0);
    DEBUG.physics.trace('updateProjectiles end', { remaining: this.projectiles.length });
  }

  explodeProjectile(proj) {
    DEBUG.physics.info('Взрыв снаряда', { pos: proj.position, damage: proj.damage });
    
    this.audio.play('explosion');
    this.props.spawnParticles(proj.position.clone(), 0xff4400, 30);

    let enemiesHit = 0;
    this.enemies.forEach(enemy => {
      if (enemy.state === 'dead') return;
      const dist = proj.position.distanceTo(enemy.position);
      if (dist < 5) {
        const dmg = proj.damage * (1 - dist / 5);
        enemy.takeDamage(dmg);
        enemiesHit++;
        DEBUG.combat.log(`Враг ${enemy.type} получил ${dmg.toFixed(1)} урона от взрыва`);
      }
    });
    DEBUG.combat.info(`Взрыв задел врагов: ${enemiesHit}`);

    const playerDist = proj.position.distanceTo(this.player.position);
    if (playerDist < 4) {
      const playerDmg = Math.floor(proj.damage * (1 - playerDist / 4));
      DEBUG.combat.warn(`Игрок получил урон от взрыва: ${playerDmg}`);
      this.player.takeDamage(playerDmg);
    }

    if (proj.mesh) {
      this.scene.remove(proj.mesh);
      if (proj.mesh.children[0]) this.scene.remove(proj.mesh.children[0]);
    }
    DEBUG.physics.trace('Взрыв завершен');
  }

  updatePickups(dt) {
    DEBUG.world.trace('updatePickups', { count: this.pickups.length });
    
    this.pickups.forEach(pickup => {
      if (!pickup.active) return;

      pickup.mesh.rotation.y += dt * 2;
      pickup.mesh.rotation.x += dt;
      pickup.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.15;

      const dist = this.player.position.distanceTo(pickup.position);
      if (dist < 1.5) {
        DEBUG.world.info(`Подбор предмета: ${pickup.type}`);
        switch (pickup.type) {
          case 'health':
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 25);
            DEBUG.entity.log(`Здоровье восстановлено: ${this.player.health}`);
            break;
          case 'armor':
            this.player.armor = Math.min(this.player.maxArmor, this.player.armor + 30);
            DEBUG.entity.log(`Броня восстановлена: ${this.player.armor}`);
            break;
          case 'ammo':
            this.player.weapons.forEach(w => w.ammo = Math.min(w.maxAmmo, w.ammo + 25));
            DEBUG.combat.log('Патроны подобраны');
            break;
        }
        pickup.active = false;
        pickup.mesh.visible = false;
        this.audio.play('pickup');
        this.hud.update();
      }
    });
  }

  showHitMarker() {
    const marker = document.createElement('div');
    marker.className = 'hit-marker';
    marker.innerHTML = '✕';
    document.body.appendChild(marker);
    setTimeout(() => marker.remove(), 300);
  }

  gameOver() {
    this.running = false;
    document.exitPointerLock();

    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    overlay.querySelector('h1').textContent = 'YOU DIED';
    overlay.querySelector('.subtitle').textContent = `SCORE: ${this.score} | KILLS: ${this.enemiesKilled}`;
    overlay.querySelector('.start-btn').textContent = 'RESPAWN';
    overlay.querySelector('.start-btn').onclick = () => location.reload();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.hud.updateMinimap();
  }

  start() {
    this.audio.init();
    this.running = true;
    this.input.lock(this.renderer.domElement);
    document.getElementById('overlay').classList.add('hidden');
    this.hud.update();

    const loop = () => {
      if (!this.running) return;
      this.deltaTime = Math.min(this.clock.getDelta(), 0.05);
      this.update(this.deltaTime);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
