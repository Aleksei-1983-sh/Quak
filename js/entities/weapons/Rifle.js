// Винтовка (Pulse Rifle) - автоматическое оружие
class Rifle extends Weapon {
  constructor() {
    super({
      name: 'PULSE RIFLE',
      type: 'ray',
      damage: 12,
      fireRate: 0.15,
      ammo: 200,
      maxAmmo: 200,
      reloadTime: 1.8,
      spread: 0.02,
      sound: 'pulse_rifle',
      color: 0x00ff44,
      auto: true,
      icon: '🔫',
      recoilAmount: 0.08,
      fireKick: 0.08,
      recoverySpeed: 11,
      muzzleFlashColor: 0x00ff88,
      tracerColor: 0x00ff44,
      modelConfig: {
        stockColor: 0x2d2d2d,
        bodyColor: 0x1a4d1a,
        accentColor: 0x00ff44,
        magazineColor: 0x333333
      }
    });
  }

  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.45), new THREE.MeshLambertMaterial({ color: this.modelConfig.bodyColor }));
    body.position.set(0.25, -0.18, -0.4);
    weaponGroup.add(body);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.2), new THREE.MeshLambertMaterial({ color: this.modelConfig.stockColor }));
    stock.position.set(0.25, -0.19, -0.15);
    weaponGroup.add(stock);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.35, 8), new THREE.MeshLambertMaterial({ color: 0x444444 }));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.16, -0.65);
    weaponGroup.add(barrel);

    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.3, 2);
    gunLight.position.set(0.25, -0.13, -0.75);
    weaponGroup.add(gunLight);

    return { weaponGroup, weaponMesh: body, gunLight };
  }
}
