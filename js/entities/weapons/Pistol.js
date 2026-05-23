// Пистолет - базовое оружие с низким уроном но высокой точностью
class Pistol extends Weapon {
  constructor() {
    super({
      name: 'PISTOL',
      type: 'ray',
      damage: 15,
      fireRate: 0.25,
      ammo: 50,
      maxAmmo: 50,
      spread: 0.01,
      sound: 'pistol',
      color: 0x888888,
      auto: false,
      icon: '🔫',
      recoilAmount: 0.08,
      muzzleFlashColor: 0xffffaa,
      tracerColor: 0xcccccc,
      modelConfig: {
        barrelLength: 0.25,
        gripColor: 0x4a3728,
        slideColor: 0x666666,
        frameColor: 0x333333
      }
    });
  }
  
  // Создать уникальную 3D модель пистолета
  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    
    // Рамка пистолета
    const frameGeo = new THREE.BoxGeometry(0.06, 0.1, 0.3);
    const frameMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.frameColor });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0.25, -0.22, -0.35);
    weaponGroup.add(frame);
    
    // Затвор (slide)
    const slideGeo = new THREE.BoxGeometry(0.065, 0.06, 0.2);
    const slideMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.slideColor });
    const slide = new THREE.Mesh(slideGeo, slideMat);
    slide.position.set(0.25, -0.15, -0.45);
    weaponGroup.add(slide);
    
    // Рукоятка
    const gripGeo = new THREE.BoxGeometry(0.055, 0.12, 0.08);
    const gripMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.gripColor });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.rotation.x = -0.2;
    grip.position.set(0.25, -0.28, -0.25);
    weaponGroup.add(grip);
    
    // Ствол
    const barrelGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.15, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.15, -0.58);
    weaponGroup.add(barrel);
    
    // Прицельная мушка
    const sightGeo = new THREE.BoxGeometry(0.02, 0.015, 0.02);
    const sightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sight = new THREE.Mesh(sightGeo, sightMat);
    sight.position.set(0.25, -0.11, -0.55);
    weaponGroup.add(sight);
    
    // Свет от выстрела
    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.3, 2);
    gunLight.position.set(0.25, -0.12, -0.6);
    weaponGroup.add(gunLight);
    
    return { weaponGroup, weaponMesh: frame, gunLight };
  }
  
  // Специфичный метод для пистолета - быстрый выстрел
  quickShot() {
    const originalDamage = this.damage;
    const originalFireRate = this.fireRate;
    this.damage = 10;
    this.fireRate = 0.15;
    
    setTimeout(() => {
      this.damage = originalDamage;
      this.fireRate = originalFireRate;
    }, 500);
  }
  
  // Анимация для пистолета - более резкая отдача
  update(dt, weaponGroup, isFiring, isReloading, reloadTimer) {
    if (!weaponGroup) return;

    // Параметры анимации
    const recoilVelocity = -5.0; // Сила отдачи назад
    const muzzleRise = 0.05;     // Подъем ствола вверх (в радианах)
    const returnSpeed = 0.2;     // Скорость возврата оружия на место
    const sideTiltMultiplier = 0.02; // Боковой наклон при отдаче
    const idleSwayAmount = 0.005; // Покачивание в покое (дыхание)
    
    // Инициализация переменных отдачи, если их нет
    if (this.recoilOffset === undefined) {
      this.recoilOffset = new THREE.Vector3(0, 0, 0);
    }
    if (this.fireRot === undefined) {
      this.fireRot = new THREE.Euler(0, 0, 0, 'YXZ');
    }
    if (this.hasFiredThisFrame === undefined) {
      this.hasFiredThisFrame = false;
    }
    if (this.walkSway === undefined) {
      this.walkSway = new THREE.Vector3(0, 0, 0);
    }
    if (this.lastMoveDir === undefined) {
      this.lastMoveDir = new THREE.Vector3(0, 0, 0);
    }

    // Сброс флага выстрела в начале кадра
    this.hasFiredThisFrame = false;

    // Получаем информацию о движении игрока
    const game = window.gameInstance;
    let moveSpeed = 0;
    let moveDir = new THREE.Vector3(0, 0, 0);
    
    if (game && game.player) {
      // Получаем направление движения
      const input = game.input;
      const yaw = game.player.yaw;
      
      let forward = 0;
      let right = 0;
      
      if (input.keys['KeyW'] || input.keys['ArrowUp']) forward = 1;
      if (input.keys['KeyS'] || input.keys['ArrowDown']) forward = -1;
      if (input.keys['KeyD'] || input.keys['ArrowRight']) right = 1;
      if (input.keys['KeyA'] || input.keys['ArrowLeft']) right = -1;
      
      if (forward !== 0 || right !== 0) {
        // Нормализуем диагональное движение
        const len = Math.sqrt(forward * forward + right * right);
        forward /= len;
        right /= len;
        
        // Вычисляем направление в мире
        moveDir.x = Math.sin(yaw) * forward + Math.cos(yaw) * right;
        moveDir.z = Math.cos(yaw) * forward - Math.sin(yaw) * right;
        moveSpeed = Math.sqrt(moveDir.x * moveDir.x + moveDir.z * moveDir.z);
      }
    }

    // --- АНИМАЦИЯ ПОКАЧИВАНИЯ ПРИ ХОДЬБЕ ---
    if (moveSpeed > 0.1) {
      // Целевое смещение зависит от направления движения
      const targetSwayX = -moveDir.x * 0.15; // Боковое смещение
      const targetSwayY = Math.sin(Date.now() * 0.01) * 0.03 * moveSpeed; // Вертикальная тряска
      const targetSwayZ = -moveDir.z * 0.15; // Смещение вперед-назад
      
      // Плавное движение к целевому значению
      this.walkSway.x += (targetSwayX - this.walkSway.x) * 0.15;
      this.walkSway.y += (targetSwayY - this.walkSway.y) * 0.15;
      this.walkSway.z += (targetSwayZ - this.walkSway.z) * 0.15;
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

    // --- АНИМАЦИЯ ОТДАЧИ ---
    if (isFiring && !this.hasFiredThisFrame) {
      this.recoilOffset.z += recoilVelocity * dt;
      this.fireRot.x += muzzleRise;
      this.fireRot.z += (Math.random() - 0.5) * sideTiltMultiplier;
      this.hasFiredThisFrame = true;
    }

    // Возврат оружия на место
    this.recoilOffset.z += (0 - this.recoilOffset.z) * returnSpeed;
    this.fireRot.x += (0 - this.fireRot.x) * returnSpeed;
    this.fireRot.y += (0 - this.fireRot.y) * returnSpeed;
    this.fireRot.z += (0 - this.fireRot.z) * returnSpeed;

    // Добавляем небольшое покачивание в покое (дыхание)
    const idleSway = Math.sin(Date.now() * 0.002) * idleSwayAmount;
    this.fireRot.x += idleSway;

    // Применяем отдачу и вращение
    weaponGroup.position.z += this.recoilOffset.z;
    weaponGroup.rotation.x = this.fireRot.x;
    weaponGroup.rotation.y = this.fireRot.y;
    weaponGroup.rotation.z = this.fireRot.z;

    // Перезарядка (если есть анимация)
    if (isReloading) {
      weaponGroup.rotation.x = -0.5 * Math.sin(reloadTimer * Math.PI);
      weaponGroup.rotation.z = 0.3 * Math.cos(reloadTimer * Math.PI);
    } else {
      weaponGroup.rotation.z *= 0.9;
    }
  }
}
