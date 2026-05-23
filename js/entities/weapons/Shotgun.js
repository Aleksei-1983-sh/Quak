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
      reloadTime: 2.2,
      pellets: 8,
      spread: 0.08,
      sound: 'shotgun',
      color: 0xff8800,
      auto: false,
      icon: '💥',
      recoilAmount: 0.2,
      fireKick: 0.17,
      recoverySpeed: 8,
      reloadTilt: 0.45,
      muzzleFlashColor: 0xffaa00,
      tracerColor: 0xff8800,
      modelConfig: {
        stockColor: 0x4a3728,
        receiverColor: 0x555555,
        barrelColor: 0x333333,
        pumpColor: 0x2d2d2d
      }
    });
  }

  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.09, 0.2), new THREE.MeshLambertMaterial({ color: this.modelConfig.receiverColor }));
    receiver.position.set(0.25, -0.18, -0.35);
    weaponGroup.add(receiver);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.45, 8), new THREE.MeshLambertMaterial({ color: this.modelConfig.barrelColor }));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.16, -0.6);
    weaponGroup.add(barrel);

    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.5, 3);
    gunLight.position.set(0.25, -0.14, -0.85);
    weaponGroup.add(gunLight);

    return { weaponGroup, weaponMesh: receiver, gunLight };
  }
}
