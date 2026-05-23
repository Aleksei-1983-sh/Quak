// Дробовик - оружие ближнего боя с множеством пуль
class Shotgun extends Weapon {
  constructor() {
    super({
      name: 'SHOTGUN',
      type: 'ray_multi',
      damage: 8,
      fireRate: 0.8,
      ammo: 20,
      maxAmmo: 20,
      pellets: 8,
      spread: 0.08,
      sound: 'shotgun',
      color: 0xff8800,
      auto: false,
      icon: '💥',
      recoilAmount: 0.15,
      muzzleFlashColor: 0xffaa00,
      tracerColor: 0xff8800,
      modelConfig: {
        barrelLength: 0.5,
        stockColor: 0x4a3728,
        receiverColor: 0x555555,
        barrelColor: 0x333333,
        pumpColor: 0x2d2d2d
      }
    });
  }
  
  // Создать уникальную 3D модель дробовика
  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    
    // Приклад
    const stockGeo = new THREE.BoxGeometry(0.07, 0.1, 0.25);
    const stockMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.stockColor });
    const stock = new THREE.Mesh(stockGeo, stockMat);
    stock.position.set(0.25, -0.2, -0.15);
    weaponGroup.add(stock);
    
    // Ствольная коробка (receiver)
    const receiverGeo = new THREE.BoxGeometry(0.075, 0.09, 0.2);
    const receiverMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.receiverColor });
    const receiver = new THREE.Mesh(receiverGeo, receiverMat);
    receiver.position.set(0.25, -0.18, -0.35);
    weaponGroup.add(receiver);
    
    // Основной ствол
    const barrelGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.45, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.barrelColor });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.16, -0.6);
    weaponGroup.add(barrel);
    
    // Подствольный магазин (tube magazine)
    const tubeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.35, 8);
    const tubeMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.barrelColor });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0.25, -0.22, -0.55);
    weaponGroup.add(tube);
    
    // Цевье (pump)
    const pumpGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.15, 8);
    const pumpMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.pumpColor });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.rotation.x = Math.PI / 2;
    pump.position.set(0.25, -0.22, -0.42);
    weaponGroup.add(pump);
    
    // Рукоятка пистолетного типа
    const gripGeo = new THREE.BoxGeometry(0.05, 0.11, 0.07);
    const gripMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.stockColor });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.rotation.x = -0.2;
    grip.position.set(0.25, -0.27, -0.28);
    weaponGroup.add(grip);
    
    // Мушка
    const sightGeo = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    const sightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sight = new THREE.Mesh(sightGeo, sightMat);
    sight.position.set(0.25, -0.13, -0.82);
    weaponGroup.add(sight);
    
    // Свет от выстрела
    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.5, 3);
    gunLight.position.set(0.25, -0.14, -0.85);
    weaponGroup.add(gunLight);
    
    return { weaponGroup, weaponMesh: receiver, gunLight };
  }
  
  // Специфичный метод для дробовика - мощный выстрел
  powerShot() {
    const originalPellets = this.pellets;
    const originalSpread = this.spread;
    const originalDamage = this.damage;
    
    this.pellets = 12;
    this.spread = 0.12;
    this.damage = 6;
    
    setTimeout(() => {
      this.pellets = originalPellets;
      this.spread = originalSpread;
      this.damage = originalDamage;
    }, 1000);
  }
  
  // Получить количество пуль
  getPelletCount() {
    return this.pellets;
  }
  
  // Анимация для дробовика - сильная отдача, перезарядка помповым движением
  update(dt, weaponGroup, isFiring, isReloading, reloadTimer) {
    if (!weaponGroup) return;

    // Параметры анимации для дробовика
    const recoilVelocity = 15.0;     // Сила отдачи назад (положительное = откат к игроку, очень сильная)
    const muzzleRise = 0.12;         // Подъем ствола вверх (сильный)
    const returnSpeed = 0.15;        // Скорость возврата оружия на место (медленная)
    const sideTiltMultiplier = 0.03; // Боковой наклон при отдаче
    
    // Применяем отдачу через универсальный метод базового класса
    this.applyRecoil(dt, weaponGroup, isFiring, recoilVelocity, muzzleRise, returnSpeed, sideTiltMultiplier, 'Shotgun');

    // Перезарядка - помповое движение
    if (isReloading) {
      // Помповое движение вперед-назад
      const pumpPhase = Math.sin(reloadTimer * Math.PI * 2);
      weaponGroup.position.z += pumpPhase * 0.08;
      weaponGroup.rotation.x = -0.2 * Math.cos(reloadTimer * Math.PI);
    }
  }
}
