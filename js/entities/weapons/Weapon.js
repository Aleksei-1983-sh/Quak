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
  
  /**
   * Создать 3D модель оружия (переопределяется в наследниках)
   * @param {Object} THREE - Библиотека Three.js
   * @returns {Object} Объект с weaponGroup, weaponMesh и gunLight
   */
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
  
  /**
   * Обработка отдачи оружия при выстреле
   * Этот метод рассчитывает и применяет смещение отдачи к оружию
   * 
   * @param {number} dt - Дельта времени (время между кадрами)
   * @param {THREE.Group} weaponGroup - Группа 3D объекта оружия
   * @param {boolean} isFiring - Флаг текущего выстрела
   * @param {number} recoilVelocity - Сила отдачи назад (положительное = к игроку)
   * @param {number} muzzleRise - Угол подъема ствола вверх (в радианах)
   * @param {number} returnSpeed - Скорость возврата оружия на место (0.0-1.0)
   * @param {number} sideTiltMultiplier - Множитель бокового наклона при отдаче
   * @param {string} weaponName - Название оружия для отладки
   */
  applyRecoil(dt, weaponGroup, isFiring, recoilVelocity, muzzleRise, returnSpeed, sideTiltMultiplier, weaponName = 'Weapon') {
    if (!weaponGroup) return;
    
    // Инициализация переменных отдачи при первом вызове
    // recoilOffset - вектор смещения оружия от базовой позиции
    if (this.recoilOffset === undefined) {
      this.recoilOffset = new THREE.Vector3(0, 0, 0);
    }
    // fireRot - углы вращения оружия при стрельбе
    if (this.fireRot === undefined) {
      this.fireRot = new THREE.Euler(0, 0, 0, 'YXZ');
    }
    // hasFiredThisFrame - флаг для предотвращения множественной отдачи за один выстрел
    if (this.hasFiredThisFrame === undefined) {
      this.hasFiredThisFrame = false;
    }
    
    // Сохраняем базовую позицию оружия (позиция без учета отдачи)
    // Это нужно чтобы оружие не улетало навсегда, а возвращалось на место
    if (this.basePosition === undefined) {
      this.basePosition = weaponGroup.position.clone();
    }
    
    // Сбрасываем флаг выстрела в начале каждого кадра
    this.hasFiredThisFrame = false;
    
    // ==========================================
    // 💥 ЛОГИКА ОТДАЧИ ПРИ ВЫСТРЕЛЕ
    // ==========================================
    
    if (isFiring && !this.hasFiredThisFrame) {
      // Применяем мгновенный импульс отдачи
      // Оружие резко смещается назад по оси Z (к игроку)
      this.recoilOffset.z += recoilVelocity * dt;
      
      // Ствол резко задирается вверх по оси X
      this.fireRot.x += muzzleRise;
      
      // Добавляем небольшой случайный наклон вбок для реализма
      this.fireRot.z += (Math.random() - 0.5) * sideTiltMultiplier;
      
      DEBUG.combat.trace(`[RECOIL] ${weaponName} выстрел`, { 
        recoilOffset: this.recoilOffset.z.toFixed(3),
        fireRot: this.fireRot.x.toFixed(3)
      });

      this.hasFiredThisFrame = true;
    }

    // ==========================================
    // 🔄 ПЛАВНЫЙ ВОЗВРАТ ОРУЖИЯ (LERP)
    // ==========================================
    // Оружие стремится вернуться в исходное положение (0, 0, 0)
    // lerp(start, end, factor) - линейная интерполяция
    
    // Возврат смещения позиции (откат назад исчезает)
    this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), returnSpeed);
    
    // Возврат вращения (ствол опускается, наклон выправляется)
    // Euler.lerp не существует, поэтому интерполируем каждый компонент отдельно
    this.fireRot.x += (0 - this.fireRot.x) * returnSpeed;
    this.fireRot.y += (0 - this.fireRot.y) * returnSpeed;
    this.fireRot.z += (0 - this.fireRot.z) * returnSpeed;

    // ==========================================
    // 🎭 ПРИМЕНЕНИЕ ТРАНСФОРМАЦИЙ К МОДЕЛИ
    // ==========================================
    
    // Устанавливаем позицию оружия как базовая + смещение отдачи
    // Это гарантирует что оружие всегда вернется на свою базовую позицию
    weaponGroup.position.copy(this.basePosition);
    weaponGroup.position.z += this.recoilOffset.z;
    
    // Применяем вращение от отдачи (подъем ствола и боковой наклон)
    weaponGroup.rotation.x = this.fireRot.x;
    weaponGroup.rotation.y = this.fireRot.y;
    weaponGroup.rotation.z = this.fireRot.z;
  }
  
  /**
   * Обновление анимации оружия (переопределяется в наследниках)
   * Базовая реализация включает анимацию перезарядки и вызов applyRecoil
   */
  update(dt, weaponGroup, isFiring, isReloading, reloadTimer) {
    if (!weaponGroup) return;
    
    // Базовые параметры отдачи (могут быть переопределены в наследниках)
    const recoilVelocity = 5.0;
    const muzzleRise = 0.05;
    const returnSpeed = 0.2;
    const sideTiltMultiplier = 0.02;
    
    // Применяем отдачу через универсальный метод
    this.applyRecoil(dt, weaponGroup, isFiring, recoilVelocity, muzzleRise, returnSpeed, sideTiltMultiplier, this.name);
    
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

// Алиас для обратной совместимости
const Weapon = BaseWeapon;
