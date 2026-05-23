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
  
  // Анимация для ракетницы - переопределяем для особых эффектов
  update(dt, weaponGroup, isFiring, isReloading, reloadTimer) {
    // Вызываем базовую реализацию из Weapon.js
    super.update(dt, weaponGroup, isFiring, isReloading, reloadTimer);
    
    // Дополнительные эффекты только для ракетницы
    if (this.model && isFiring) {
      // Дополнительная тряска при выстреле ракетницы
      weaponGroup.position.y += Math.sin(Date.now() * 0.1) * 0.008;
    }
    
    // Специфичная анимация перезарядки для ракетницы
    if (isReloading) {
      const reloadProgress = reloadTimer / (this.reloadTime || 2.0);
      weaponGroup.rotation.x = -0.8 * Math.sin(reloadProgress * Math.PI);
      weaponGroup.position.y = 0.15 * Math.cos(reloadProgress * Math.PI);
    }
  }
}
