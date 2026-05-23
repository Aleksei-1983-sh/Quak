// Ракетница - оружие с проектами и взрывным уроном
class RocketLauncher extends Weapon {
  constructor() {
    super({
      name: 'ROCKET LAUNCHER',
      type: 'projectile',
      damage: 100,
      fireRate: 0.7,
      ammo: 10,
      maxAmmo: 10,
      spread: 0.01,
      sound: 'rocket',
      color: 0xff4400,
      auto: false,
      icon: '🚀',
      recoilAmount: 0.2,
      muzzleFlashColor: 0xff6600,
      tracerColor: 0xff4400,
      modelConfig: {
        tubeColor: 0x3d5c3d,
        gripColor: 0x4a3728,
        triggerColor: 0x2d2d2d,
        rocketColor: 0xff4400,
        sightColor: 0x888888
      }
    });
    
    // Инициализация переменных отдачи для анимации
    this.recoilOffset = new THREE.Vector3(0, 0, 0);
    this.fireRot = new THREE.Euler(0, 0, 0);
    this.hasFiredThisFrame = false;
    this.weaponGroup = null;
    this.model = null;
  }
  
  // Создать уникальную 3D модель ракетницы
  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    
    // Основная труба
    const tubeGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.6, 12);
    const tubeMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.tubeColor });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0.25, -0.15, -0.5);
    weaponGroup.add(tube);
    
    // Задняя часть (раструб)
    const backGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.15, 12);
    const backMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.tubeColor });
    const back = new THREE.Mesh(backGeo, backMat);
    back.rotation.x = Math.PI / 2;
    back.position.set(0.25, -0.15, -0.2);
    weaponGroup.add(back);
    
    // Рукоятка
    const gripGeo = new THREE.BoxGeometry(0.05, 0.12, 0.08);
    const gripMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.gripColor });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.rotation.x = -0.15;
    grip.position.set(0.25, -0.25, -0.35);
    weaponGroup.add(grip);
    
    // Спусковая скоба
    const triggerGeo = new THREE.TorusGeometry(0.025, 0.005, 6, 12, Math.PI);
    const triggerMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.triggerColor });
    const trigger = new THREE.Mesh(triggerGeo, triggerMat);
    trigger.rotation.y = Math.PI / 2;
    trigger.position.set(0.25, -0.22, -0.42);
    weaponGroup.add(trigger);
    
    // Прицел (оптический)
    const scopeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
    const scopeMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.sightColor });
    const scope = new THREE.Mesh(scopeGeo, scopeMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0.25, -0.11, -0.45);
    weaponGroup.add(scope);
    
    // Линза прицела (красная точка)
    const lensGeo = new THREE.CircleGeometry(0.012, 8);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0.25, -0.11, -0.39);
    lens.rotation.y = Math.PI / 2;
    weaponGroup.add(lens);
    
    // Ножка для упора
    const standGeo = new THREE.BoxGeometry(0.02, 0.08, 0.08);
    const standMat = new THREE.MeshLambertMaterial({ color: 0x2d2d2d });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.set(0.25, -0.25, -0.55);
    weaponGroup.add(stand);
    
    // Свет от выстрела (яркий оранжевый)
    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.8, 4);
    gunLight.position.set(0.25, -0.13, -0.85);
    weaponGroup.add(gunLight);
    
    return { weaponGroup, weaponMesh: tube, gunLight };
  }
  
  // Специфичный метод для ракетницы - залп
  rapidFire() {
    const originalFireRate = this.fireRate;
    const originalDamage = this.damage;
    
    this.fireRate = 0.4;
    this.damage = 70;
    
    setTimeout(() => {
      this.fireRate = originalFireRate;
      this.damage = originalDamage;
    }, 2000);
  }
  
  // Получить радиус взрыва
  getExplosionRadius() {
    return 5;
  }
  
  // Переопределение метода стрельбы для ракетницы
  fireProjectile(game, camera, scene) {
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * this.spread,
      (Math.random() - 0.5) * this.spread,
      -1
    ).normalize().applyQuaternion(camera.quaternion);

    // Ракета вылетает из дула оружия, а не из камеры
    const spawnOffset = dir.clone().multiplyScalar(0.8);
    const projectile = {
      position: camera.position.clone().add(spawnOffset),
      velocity: dir.clone().multiplyScalar(20), // Медленнее чем у обычного снаряда
      damage: this.damage,
      life: 4,
      trail: [],
      weapon: this,
      explosionRadius: this.getExplosionRadius()
    };

    // Создаем модель ракеты
    const rocketGroup = new THREE.Group();
    
    // Корпус ракеты
    const bodyGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8);
    const bodyMat = new THREE.MeshBasicMaterial({ color: this.modelConfig.rocketColor });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    rocketGroup.add(body);
    
    // Носовая часть
    const noseGeo = new THREE.ConeGeometry(0.08, 0.15, 8);
    const noseMat = new THREE.MeshBasicMaterial({ color: 0xff6622 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = -0.22;
    rocketGroup.add(nose);
    
    // Хвостовые стабилизаторы
    for (let i = 0; i < 4; i++) {
      const finGeo = new THREE.BoxGeometry(0.08, 0.02, 0.06);
      const finMat = new THREE.MeshBasicMaterial({ color: 0x884400 });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.rotation.y = (i * Math.PI) / 2;
      fin.position.z = 0.1;
      rocketGroup.add(fin);
    }
    
    // Светящийся след
    const glowGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({ 
      color: 0xffaa00, 
      transparent: true, 
      opacity: 0.8 
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = 0.15;
    rocketGroup.add(glow);
    
    rocketGroup.position.copy(projectile.position);
    rocketGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().negate());
    scene.add(rocketGroup);
    projectile.mesh = rocketGroup;

    const light = new THREE.PointLight(this.color, 1.5, 10);
    light.position.set(0, 0, 0.1);
    rocketGroup.add(light);

    game.projectiles.push(projectile);
  }
  
  // Анимация для ракетницы - очень сильная отдача
  update(dt, weaponGroup, isFiring, isReloading, reloadTimer) {
    super.update(dt, weaponGroup, isFiring, isReloading, reloadTimer);

    // ==========================================
    // 🎨 НАСТРОЙКИ АНИМАЦИИ РОКЕТНИЦЫ
    // ==========================================
    // Здесь можно менять поведение оружия при стрельбе и перезарядке.
    // Экспериментируйте с этими параметрами для получения нужного ощущения!
    
    // 1. ОТДАЧА (RECOIL) - сила удара назад при выстреле
    // --------------------------------------------------
    // Чем больше число по модулю, тем сильнее откатывается оружие.
    // Ось Z: отрицательное значение = откат назад (к игроку).
    // Примеры:
    //   -5.0  -> слабый толчок (пистолет)
    //   -8.0  -> средний толчок (автомат)
    //   -12.0 -> сильный удар (дробовик)
    //   -20.0 -> очень мощный откат (ракетница, снайперка)
    const recoilVelocity = -18.0; 

    // 2. ПОДЪЕМ СТВОЛА (MUZZLE RISE) - вращение вверх при выстреле
    // ------------------------------------------------------------
    // Насколько сильно ствол задирается вверх.
    // Это угол в радианах за кадр выстрела.
    // Примеры:
    //   0.05 -> почти нет подброса
    //   0.15 -> заметный подброс
    //   0.3  -> сильный подброс ствола
    const muzzleRise = 0.25;

    // 3. ВОЗВРАТ (RECOVERY SPEED) - скорость возврата в исходное положение
    // --------------------------------------------------------------------
    // Коэффициент от 0.0 до 1.0. Чем ближе к 1.0, тем быстрее возвращается.
    // Примеры:
    //   0.1  -> медленно, оружие "плавает" после выстрела
    //   0.25 -> средняя скорость (реалистично для тяжелого оружия)
    //   0.4  -> быстро, оружие резко встает на место
    //   0.6  -> очень быстро, как в аркадных шутерах
    const returnSpeed = 0.18;

    // 4. БОКОВОЙ НАКЛОН (SIDE TILT) - наклон вбок при отдаче
    // ------------------------------------------------------
    // Множитель для создания наклона оружия в сторону при откате.
    // Создает эффект веса и инерции тяжелого оружия.
    // Примеры:
    //   0.0  -> нет наклона
    //   0.02 -> легкий наклон
    //   0.05 -> заметный наклон вбок
    const sideTiltMultiplier = 0.04;

    // 5. ДЫХАНИЕ/ПОКАЧИВАНИЕ (IDLE SWAY) - амплитуда покачивания в покое
    // -------------------------------------------------------------------
    // Насколько сильно оружие "дышит" когда игрок стоит на месте.
    // Примеры:
    //   0.005 -> почти незаметно
    //   0.02  -> легкое дыхание
    //   0.05  -> заметное покачивание (усталость, тяжелое оружие)
    const idleSwayAmount = 0.03;

    // ==========================================
    // 💥 ЛОГИКА ОТДАЧИ ПРИ ВЫСТРЕЛЕ
    // ==========================================
    
    if (this.isFiring && !this.hasFiredThisFrame) {
      // Применяем мгновенный импульс отдачи
      // Оружие резко смещается назад по оси Z
      this.recoilOffset.z += recoilVelocity * dt;
      
      // Ствол резко задирается вверх
      this.fireRot.x += muzzleRise;
      
      // Добавляем небольшой случайный наклон вбок для реализма
      this.fireRot.z += (Math.random() - 0.5) * 0.05;

      this.hasFiredThisFrame = true;
    } else if (!this.isFiring) {
      this.hasFiredThisFrame = false;
    }

    // ==========================================
    // 🔄 ПЛАВНЫЙ ВОЗВРАТ ОРУЖИЯ (LERP)
    // ==========================================
    // Оружие стремится вернуться в исходное положение (0, 0, 0)
    // lerp(start, end, factor) - линейная интерполяция
    
    // Возврат позиции (откат назад исчезает)
    this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), returnSpeed);
    
    // Возврат вращения (ствол опускается, наклон выправляется)
    // Euler.lerp не существует, поэтому интерполируем каждый компонент отдельно
    this.fireRot.x += (0 - this.fireRot.x) * returnSpeed;
    this.fireRot.y += (0 - this.fireRot.y) * returnSpeed;
    this.fireRot.z += (0 - this.fireRot.z) * returnSpeed;

    // ==========================================
    // 🔁 АНИМАЦИЯ ПЕРЕЗАРЯДКИ
    // ==========================================
    if (isReloading) {
      // Медленное откидывание трубы ракетницы назад
      // Math.sin создает плавное движение туда-обратно
      const reloadProgress = reloadTimer / this.reloadTime;
      const tiltAngle = -0.8 * Math.sin(reloadProgress * Math.PI);
      
      // Наклон оружия вверх при перезарядке
      this.weaponGroup.rotation.x = tiltAngle;
      
      // Подъем оружия выше для удобства перезарядки
      this.weaponGroup.position.y = 0.15 * Math.cos(reloadProgress * Math.PI);
      
      // Небольшое смещение назад
      this.weaponGroup.position.z = 0.1 * (1 - reloadProgress);
    } else {
      // Плавный возврат в нейтральную позицию после перезарядки
      this.weaponGroup.rotation.x *= 0.85;
      this.weaponGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.2);
    }

    // ==========================================
    // 🎭 ПРИМЕНЕНИЕ ТРАНСФОРМАЦИЙ К МОДЕЛИ
    // ==========================================
    if (this.model) {
      // Базовая позиция с учетом отдачи
      this.model.position.copy(this.recoilOffset);
      
      // Добавляем "дыхание" - легкое покачивание в покое
      const idleSway = Math.sin(Date.now() * 0.003) * idleSwayAmount;
      this.model.position.y += idleSway;
      this.model.position.x += idleSway * 0.5;
      
      // Применяем вращение от отдачи (подъем ствола)
      this.model.rotation.x = this.fireRot.x;
      
      // Боковой наклон от отдачи + небольшой наклон для красоты
      this.model.rotation.z = this.fireRot.z + (this.recoilOffset.z * sideTiltMultiplier);
      
      // Небольшой поворот вбок при движении отдачи
      this.model.rotation.y = this.recoilOffset.z * 0.01;
    }
  }
}
