// Базовый класс для всех видов оружия
class BaseWeapon {
  constructor(config) {
    this.name = config.name || 'WEAPON';
    this.type = config.type || 'ray'; // ray, ray_multi, projectile
    this.damage = config.damage || 10;
    this.fireRate = config.fireRate || 0.5;
    this.ammo = config.ammo || 30;
    this.maxAmmo = config.maxAmmo || 30;
    this.spread = config.spread || 0.02;
    this.sound = config.sound || 'pulse_rifle';
    this.color = config.color || 0x00ff44;
    this.auto = config.auto || false;
    this.icon = config.icon || '🔫';
    this.pellets = config.pellets || 1;
    
    // Визуальные параметры для 3D модели
    this.modelConfig = config.modelConfig || {};
    this.recoilAmount = config.recoilAmount || 0.1;
    this.muzzleFlashColor = config.muzzleFlashColor || 0xffff00;
    this.tracerColor = config.tracerColor || this.color;
    
    // Переменные состояния анимации
    this.recoilOffset = new THREE.Vector3(0, 0, 0);
    this.fireRot = new THREE.Euler(0, 0, 0, 'YXZ');
    this.walkSway = new THREE.Vector3(0, 0, 0);
    this.hasFiredThisFrame = false;
    this.weaponGroup = null;
    this.model = null;
    this.lastMoveDir = new THREE.Vector3(0, 0, 0);
    
    // Получить тип оружия для мета-данных
    this.weaponType = this.getWeaponType();
  }
  
  // Определить тип оружия для получения мета-данных
  getWeaponType() {
    const name = this.name.toLowerCase();
    if (name.includes('pistol')) return 'pistol';
    if (name.includes('rifle')) return 'rifle';
    if (name.includes('shotgun')) return 'shotgun';
    if (name.includes('rocket')) return 'rocketLauncher';
    return 'pistol'; // по умолчанию
  }
  
  // Получить мета-данные анимации для этого оружия
  getAnimationMeta() {
    if (typeof WEAPON_ANIMATION_META !== 'undefined') {
      return WEAPON_ANIMATION_META[this.weaponType] || WEAPON_ANIMATION_META.pistol;
    }
    // Резервные значения если мета-данные не загружены
    return {
      idleSway: { amount: 0.005, speed: 0.002 },
      walkSway: { amountX: 0.15, amountY: 0.03, amountZ: 0.15, speed: 0.01, lerpFactor: 0.15 },
      runSwayMultiplier: 1.0,
      recoil: { velocity: -5.0, muzzleRise: 0.05, sideTilt: 0.02, returnSpeed: 0.2 }
    };
  }
  
  // Метод для получения текущей информации об оружии
  getInfo() {
    return {
      name: this.name,
      ammo: this.ammo,
      maxAmmo: this.maxAmmo,
      damage: this.damage,
      fireRate: this.fireRate
    };
  }

  // Проверка возможности стрельбы
  canFire() {
    return this.ammo > 0;
  }

  // Потратить патрон
  consumeAmmo(amount = 1) {
    if (this.ammo >= amount) {
      this.ammo -= amount;
      return true;
    }
    return false;
  }

  // Перезарядка
  reload() {
    this.ammo = this.maxAmmo;
  }

  // Получить иконку оружия
  getIcon() {
    return this.icon;
  }
  
  // === МЕТОДЫ ОТРИСОВКИ ОРУЖИЯ ===
  
  // Создать 3D модель оружия (переопределяется в наследниках)
  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    
    const gunGeo = new THREE.BoxGeometry(0.08, 0.12, 0.5);
    const gunMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const weaponMesh = new THREE.Mesh(gunGeo, gunMat);
    weaponMesh.position.set(0.25, -0.2, -0.4);
    weaponGroup.add(weaponMesh);

    const barrelGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.3, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.15, -0.7);
    weaponGroup.add(barrel);

    const gunLight = new THREE.PointLight(0xff6600, 0.3, 2);
    gunLight.position.set(0.25, -0.1, -0.5);
    weaponGroup.add(gunLight);
    
    return { weaponGroup, weaponMesh, gunLight };
  }
  
  // Обновление анимации оружия (единая реализация для всех оружий)
  update(dt, weaponGroup, isFiring, isReloading, reloadTimer) {
    if (!weaponGroup) return;
    
    // Получить мета-данные для этого оружия
    const meta = this.getAnimationMeta();
    
    // Сброс флага выстрела в начале кадра
    this.hasFiredThisFrame = false;
    
    // Получаем информацию о движении игрока
    const game = window.gameInstance;
    let moveSpeed = 0;
    let moveDir = new THREE.Vector3(0, 0, 0);
    let isRunning = false;
    
    if (game && game.player) {
      const input = game.input;
      const yaw = game.player.yaw;
      
      let forward = 0;
      let right = 0;
      
      if (input.keys['KeyW'] || input.keys['ArrowUp']) forward = 1;
      if (input.keys['KeyS'] || input.keys['ArrowDown']) forward = -1;
      if (input.keys['KeyD'] || input.keys['ArrowRight']) right = 1;
      if (input.keys['KeyA'] || input.keys['ArrowLeft']) right = -1;
      
      // Проверка бега (Shift)
      if (input.keys['ShiftLeft'] || input.keys['ShiftRight']) {
        isRunning = true;
      }
      
      if (forward !== 0 || right !== 0) {
        const len = Math.sqrt(forward * forward + right * right);
        forward /= len;
        right /= len;
        
        moveDir.x = Math.sin(yaw) * forward + Math.cos(yaw) * right;
        moveDir.z = Math.cos(yaw) * forward - Math.sin(yaw) * right;
        moveSpeed = Math.sqrt(moveDir.x * moveDir.x + moveDir.z * moveDir.z);
      }
    }
    
    // === ПОКАЧИВАНИЕ ПРИ ХОДЬБЕ/БЕГЕ ===
    const runMultiplier = isRunning ? meta.runSwayMultiplier : 1.0;
    
    if (moveSpeed > 0.1) {
      const targetSwayX = -moveDir.x * meta.walkSway.amountX * runMultiplier;
      const targetSwayY = Math.sin(Date.now() * meta.walkSway.speed) * meta.walkSway.amountY * moveSpeed * runMultiplier;
      const targetSwayZ = -moveDir.z * meta.walkSway.amountZ * runMultiplier;
      
      this.walkSway.x += (targetSwayX - this.walkSway.x) * meta.walkSway.lerpFactor;
      this.walkSway.y += (targetSwayY - this.walkSway.y) * meta.walkSway.lerpFactor;
      this.walkSway.z += (targetSwayZ - this.walkSway.z) * meta.walkSway.lerpFactor;
    } else {
      // Возврат в нейтральное положение когда игрок стоит
      this.walkSway.x += (0 - this.walkSway.x) * 0.1;
      this.walkSway.y += (0 - this.walkSway.y) * 0.1;
      this.walkSway.z += (0 - this.walkSway.z) * 0.1;
    }
    
    // Применяем покачивание от ходьбы
    weaponGroup.position.x += this.walkSway.x;
    weaponGroup.position.y += this.walkSway.y;
    weaponGroup.position.z += this.walkSway.z;
    
    // === ОТДАЧА ПРИ ВЫСТРЕЛЕ ===
    if (isFiring && !this.hasFiredThisFrame) {
      this.recoilOffset.z += meta.recoil.velocity * dt;
      this.fireRot.x += meta.recoil.muzzleRise;
      this.fireRot.z += (Math.random() - 0.5) * meta.recoil.sideTilt;
      this.hasFiredThisFrame = true;
    }
    
    // Возврат оружия на место (плавный lerp)
    this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), meta.recoil.returnSpeed);
    this.fireRot.x += (0 - this.fireRot.x) * meta.recoil.returnSpeed;
    this.fireRot.y += (0 - this.fireRot.y) * meta.recoil.returnSpeed;
    this.fireRot.z += (0 - this.fireRot.z) * meta.recoil.returnSpeed;
    
    // === ПОКАЧИВАНИЕ В ПОКОЕ (IDLE SWAY / ДЫХАНИЕ) ===
    const idleSway = Math.sin(Date.now() * meta.idleSway.speed) * meta.idleSway.amount;
    this.fireRot.x += idleSway;
    
    // Применяем отдачу и вращение к модели
    weaponGroup.position.z += this.recoilOffset.z;
    weaponGroup.rotation.x = this.fireRot.x;
    weaponGroup.rotation.y = this.fireRot.y;
    weaponGroup.rotation.z = this.fireRot.z;
    
    // Анимация перезарядки
    if (isReloading) {
      weaponGroup.rotation.x = -0.3 * Math.sin(reloadTimer * Math.PI);
      weaponGroup.rotation.z = 0.2 * Math.cos(reloadTimer * Math.PI);
    }
  }
  
  // === МЕТОДЫ СТРЕЛЬБЫ ===
  
  // Основной метод стрельбы (переопределяется в наследниках)
  fire(game, camera, scene, audio, props, hud) {
    if (!this.canFire()) return false;
    
    // Воспроизвести звук
    audio.play(this.sound);
    
    // Вспышка выстрела
    const mf = document.getElementById('muzzle-flash');
    if (mf) {
      mf.style.opacity = 1;
      setTimeout(() => mf.style.opacity = 0, 50);
    }
    
    // Стрельба в зависимости от типа
    if (this.type === 'ray' || this.type === 'ray_multi') {
      const pellets = this.pellets || 1;
      for (let i = 0; i < pellets; i++) {
        this.raycastShot(game, camera, props, this.damage, this.spread, this.tracerColor);
      }
    } else if (this.type === 'projectile') {
      this.fireProjectile(game, camera, scene);
    }
    
    this.consumeAmmo();
    return true;
  }
  
  // Raycast выстрел (для hitscan оружия)
  raycastShot(game, camera, props, damage, spread, color) {
    DEBUG.combat.trace('raycastShot start', { damage, spread, color });
    
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      -1
    );
    
    if (dir.lengthSq() === 0) {
      DEBUG.combat.warn('raycastShot: нулевой вектор направления');
      return;
    }
    dir.normalize().applyQuaternion(camera.quaternion);

    let closestHit = null;
    let closestDist = Infinity;

    game.enemies.forEach(enemy => {
      if (enemy.state === 'dead') return;
      
      const toEnemy = enemy.position.clone().sub(camera.position);
      const dist = toEnemy.length();

      if (dist < 0.1 || dist > 100) return; 
      
      const dirToEnemy = toEnemy.clone().normalize();

      const perpDist = camera.position.clone()
        .add(dir.clone().multiplyScalar(toEnemy.dot(dir)))
        .sub(enemy.position).length();

      if (perpDist < enemy.size && toEnemy.dot(dir) > 0 && dist < closestDist) {
        closestDist = dist;
        closestHit = enemy;
        DEBUG.combat.trace('Потенциальное попадание', { enemy: enemy.type, dist });
      }
    });

    if (closestHit) {
      DEBUG.combat.info('Попадание во врага!', { enemy: closestHit.type, damage, dist: closestDist });
      closestHit.takeDamage(damage);
      game.audio.play('hit');
      game.showHitMarker();
      props.spawnParticles(closestHit.position.clone(), 0xff0000, 5);
    } else {
      DEBUG.combat.trace('Промах');
    }

    const tracerDist = closestHit ? closestDist : 100;
    props.spawnTracer(camera.position.clone(), dir, tracerDist, color);
  }
  
  // Запуск снаряда (для ракетницы и т.п.)
  fireProjectile(game, camera, scene) {
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * this.spread,
      (Math.random() - 0.5) * this.spread,
      -1
    ).normalize().applyQuaternion(camera.quaternion);

    const projectile = {
      position: camera.position.clone().add(dir.clone().multiplyScalar(1)),
      velocity: dir.clone().multiplyScalar(30),
      damage: this.damage,
      life: 3,
      trail: [],
      weapon: this
    };

    const geo = new THREE.SphereGeometry(0.15, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: this.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(projectile.position);
    scene.add(mesh);
    projectile.mesh = mesh;

    const light = new THREE.PointLight(this.color, 1, 8);
    mesh.add(light);

    game.projectiles.push(projectile);
  }
}

// Алиас для обратной совместимости
const Weapon = BaseWeapon;
