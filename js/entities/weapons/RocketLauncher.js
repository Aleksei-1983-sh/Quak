// Ракетница - оружие с проектильным взрывным уроном
class RocketLauncher extends Weapon {
  constructor() {
    super({
      name: 'ROCKET LAUNCHER',
      type: 'projectile',
      damage: 100,
      fireRate: 0.7,
      ammo: 10,
      maxAmmo: 10,
      reloadTime: 2.6,
      spread: 0.01,
      sound: 'rocket',
      color: 0xff4400,
      auto: false,
      icon: '🚀',
      recoilAmount: 0.25,
      fireKick: 0.22,
      recoverySpeed: 6,
      reloadTilt: 0.65,
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
  }

  getExplosionRadius() {
    return 5;
  }

  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.6, 12), new THREE.MeshLambertMaterial({ color: this.modelConfig.tubeColor }));
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0.25, -0.15, -0.5);
    weaponGroup.add(tube);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.08), new THREE.MeshLambertMaterial({ color: this.modelConfig.gripColor }));
    grip.rotation.x = -0.15;
    grip.position.set(0.25, -0.25, -0.35);
    weaponGroup.add(grip);

    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.8, 4);
    gunLight.position.set(0.25, -0.13, -0.85);
    weaponGroup.add(gunLight);

    return { weaponGroup, weaponMesh: tube, gunLight };
  }

  fireProjectile(game, camera, scene) {
    const dir = new THREE.Vector3((Math.random() - 0.5) * this.spread, (Math.random() - 0.5) * this.spread, -1)
      .normalize()
      .applyQuaternion(camera.quaternion);

    const projectile = {
      position: camera.position.clone().add(dir.clone().multiplyScalar(0.8)),
      velocity: dir.clone().multiplyScalar(20),
      damage: this.damage,
      life: 4,
      trail: [],
      weapon: this,
      explosionRadius: this.getExplosionRadius()
    };

    const rocket = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8), new THREE.MeshBasicMaterial({ color: this.modelConfig.rocketColor }));
    rocket.rotation.x = Math.PI / 2;
    rocket.position.copy(projectile.position);
    rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().negate());
    scene.add(rocket);

    projectile.mesh = rocket;
    rocket.add(new THREE.PointLight(this.color, 1.5, 10));
    game.projectiles.push(projectile);
  }
}
