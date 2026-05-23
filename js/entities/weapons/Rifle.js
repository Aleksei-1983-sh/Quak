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
  
  // Используем базовую анимацию из Weapon.js
  // update не переопределяется - используется общая реализация
}
