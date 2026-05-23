// Пистолет - точный полуавтомат
class Pistol extends Weapon {
  constructor() {
    super({
      name: 'PISTOL',
      type: 'ray',
      damage: 15,
      fireRate: 0.25,
      ammo: 50,
      maxAmmo: 50,
      reloadTime: 1.3,
      spread: 0.01,
      sound: 'pistol',
      color: 0x888888,
      auto: false,
      icon: '🔫',
      recoilAmount: 0.12,
      fireKick: 0.1,
      recoverySpeed: 13,
      muzzleFlashColor: 0xffffaa,
      tracerColor: 0xcccccc,
      modelConfig: {
        gripColor: 0x4a3728,
        slideColor: 0x666666,
        frameColor: 0x333333
      }
    });
  }

  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.3), new THREE.MeshLambertMaterial({ color: this.modelConfig.frameColor }));
    frame.position.set(0.25, -0.22, -0.35);
    weaponGroup.add(frame);

    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.06, 0.2), new THREE.MeshLambertMaterial({ color: this.modelConfig.slideColor }));
    slide.position.set(0.25, -0.15, -0.45);
    weaponGroup.add(slide);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.08), new THREE.MeshLambertMaterial({ color: this.modelConfig.gripColor }));
    grip.rotation.x = -0.2;
    grip.position.set(0.25, -0.28, -0.25);
    weaponGroup.add(grip);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.15, 8), new THREE.MeshLambertMaterial({ color: 0x555555 }));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.15, -0.58);
    weaponGroup.add(barrel);

    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.3, 2);
    gunLight.position.set(0.25, -0.12, -0.6);
    weaponGroup.add(gunLight);

    return { weaponGroup, weaponMesh: frame, gunLight };
  }
}
