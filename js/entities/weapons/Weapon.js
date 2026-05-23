// Базовый класс для всех видов оружия
class Weapon {
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
  
  // Обновление анимации оружия (переопределяется в наследниках)
  update(dt, weaponGroup, isFiring, isReloading, reloadTimer) {
    if (!weaponGroup) return;
    
    // Анимация отдачи при выстреле
    if (isFiring) {
      weaponGroup.position.z = -this.recoilAmount;
    } else {
      weaponGroup.position.z *= 0.9;
    }
    
    // Анимация перезарядки
    if (isReloading) {
      weaponGroup.rotation.x = -0.3 * Math.sin(reloadTimer * Math.PI);
    } else {
      weaponGroup.rotation.x *= 0.9;
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

