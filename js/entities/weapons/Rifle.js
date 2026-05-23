// Винтовка (Pulse Rifle) - базовое автоматическое оружие
class Rifle extends Weapon {
  constructor() {
    super({
      name: 'PULSE RIFLE',
      type: 'ray',
      damage: 12,
      fireRate: 0.15,
      ammo: 200,
      maxAmmo: 200,
      spread: 0.02,
      sound: 'pulse_rifle',
      color: 0x00ff44,
      auto: true,
      icon: '🔫',
      recoilAmount: 0.06,
      muzzleFlashColor: 0x00ff88,
      tracerColor: 0x00ff44,
      modelConfig: {
        barrelLength: 0.4,
        stockColor: 0x2d2d2d,
        bodyColor: 0x1a4d1a,
        accentColor: 0x00ff44,
        magazineColor: 0x333333
      }
    });
  }
  
  // Создать уникальную 3D модель винтовки
  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    
    // Основной корпус
    const bodyGeo = new THREE.BoxGeometry(0.07, 0.1, 0.45);
    const bodyMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.bodyColor });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0.25, -0.18, -0.4);
    weaponGroup.add(body);
    
    // Приклад
    const stockGeo = new THREE.BoxGeometry(0.06, 0.09, 0.2);
    const stockMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.stockColor });
    const stock = new THREE.Mesh(stockGeo, stockMat);
    stock.position.set(0.25, -0.19, -0.15);
    weaponGroup.add(stock);
    
    // Ствол
    const barrelGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.35, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.16, -0.65);
    weaponGroup.add(barrel);
    
    // Магазин
    const magGeo = new THREE.BoxGeometry(0.05, 0.15, 0.08);
    const magMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.magazineColor });
    const magazine = new THREE.Mesh(magGeo, magMat);
    magazine.rotation.x = 0.15;
    magazine.position.set(0.25, -0.28, -0.35);
    weaponGroup.add(magazine);
    
    // Рукоятка
    const gripGeo = new THREE.BoxGeometry(0.04, 0.1, 0.06);
    const gripMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.stockColor });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.rotation.x = -0.25;
    grip.position.set(0.25, -0.26, -0.3);
    weaponGroup.add(grip);
    
    // Энергетические акценты (светящиеся полосы)
    const accentGeo = new THREE.BoxGeometry(0.072, 0.02, 0.3);
    const accentMat = new THREE.MeshBasicMaterial({ color: this.modelConfig.accentColor });
    const accent = new THREE.Mesh(accentGeo, accentMat);
    accent.position.set(0.25, -0.14, -0.45);
    weaponGroup.add(accent);
    
    // Прицел
    const sightGeo = new THREE.BoxGeometry(0.025, 0.02, 0.03);
    const sightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sight = new THREE.Mesh(sightGeo, sightMat);
    sight.position.set(0.25, -0.12, -0.6);
    weaponGroup.add(sight);
    
    // Свет от выстрела
    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.3, 2);
    gunLight.position.set(0.25, -0.13, -0.75);
    weaponGroup.add(gunLight);
    
    return { weaponGroup, weaponMesh: body, gunLight };
  }
  
  // Специфичный метод для винтовки - режим точной стрельбы
  setPrecisionMode(precision) {
    if (precision) {
      this.spread = 0.01;
      this.fireRate = 0.3;
    } else {
      this.spread = 0.02;
      this.fireRate = 0.15;
    }
  }
  
  // Анимация для винтовки - плавная отдача при автоматической стрельбе
  update(dt, weaponGroup, isFiring, isReloading, reloadTimer) {
    if (!weaponGroup) return;

    // Параметры анимации
    const recoilVelocity = -8.0; // Сила отдачи назад (автоматическое оружие)
    const muzzleRise = 0.03;     // Подъем ствола вверх (меньше чем у пистолета)
    const returnSpeed = 0.25;    // Скорость возврата оружия на место
    const sideTiltMultiplier = 0.015; // Боковой наклон при отдаче
    const idleSwayAmount = 0.004; // Покачивание в покое (дыхание)
    
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
      const targetSwayX = -moveDir.x * 0.12; // Боковое смещение (меньше чем у пистолета)
      const targetSwayY = Math.sin(Date.now() * 0.012) * 0.025 * moveSpeed; // Вертикальная тряска
      const targetSwayZ = -moveDir.z * 0.12; // Смещение вперед-назад
      
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

    // Вибрация при автоматической стрельбе
    if (isFiring) {
      weaponGroup.position.y += Math.sin(Date.now() * 0.05) * 0.005;
    }

    // Применяем отдачу и вращение
    weaponGroup.position.z += this.recoilOffset.z;
    weaponGroup.rotation.x = this.fireRot.x;
    weaponGroup.rotation.y = this.fireRot.y;
    weaponGroup.rotation.z = this.fireRot.z;

    // Перезарядка (если есть анимация)
    if (isReloading) {
      weaponGroup.rotation.x = -0.4 * Math.sin(reloadTimer * Math.PI);
      weaponGroup.position.y = 0.05 * Math.cos(reloadTimer * Math.PI);
    } else {
      weaponGroup.position.y *= 0.9;
    }
  }
}
