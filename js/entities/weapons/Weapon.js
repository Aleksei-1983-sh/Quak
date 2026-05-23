// Базовый класс для всех видов оружия
class Weapon {
  constructor(config = {}) {
    const defaults = {
      // Идентификация
      name: 'WEAPON',
      icon: '🔫',

      // Баланс
      type: 'ray', // ray, ray_multi, projectile
      damage: 10,
      fireRate: 0.5,
      auto: false,
      spread: 0.02,
      pellets: 1,
      ammo: 30,
      maxAmmo: 30,
      reloadTime: 1.5,

      // FX
      sound: 'pulse_rifle',
      color: 0x00ff44,
      muzzleFlashColor: 0xffff00,
      tracerColor: null,

      // Анимация
      recoilAmount: 0.1,
      fireKick: 0.12,
      recoverySpeed: 10,
      swayIdleX: 0.006,
      swayIdleY: 0.004,
      swayMoveX: 0.015,
      swayMoveY: 0.01,
      swaySpeed: 8,
      sprintSwayMultiplier: 1.4,
      reloadTilt: 0.35,

      // Модель
      modelConfig: {}
    };

    const merged = { ...defaults, ...config };

    Object.assign(this, merged);
    if (this.tracerColor == null) this.tracerColor = this.color;

    this.state = {
      isFiring: false,
      isReloading: false,
      isMoving: false,
      isSprinting: false,
      reloadProgress: 0,
      time: 0,
      dt: 0
    };

    this.anim = {
      recoilZ: 0,
      rotX: 0,
      rotZ: 0
    };
  }

  setState(nextState = {}) {
    this.state = { ...this.state, ...nextState };
  }

  getInfo() {
    return {
      name: this.name,
      ammo: this.ammo,
      maxAmmo: this.maxAmmo,
      damage: this.damage,
      fireRate: this.fireRate,
      reloadTime: this.reloadTime,
      auto: this.auto
    };
  }

  canFire() {
    return this.ammo > 0 && !this.state.isReloading;
  }

  canReload() {
    return this.ammo < this.maxAmmo && !this.state.isReloading;
  }

  consumeAmmo(amount = 1) {
    if (this.ammo >= amount) {
      this.ammo -= amount;
      return true;
    }
    return false;
  }

  reload() {
    this.ammo = this.maxAmmo;
  }

  getIcon() {
    return this.icon;
  }

  createModel(THREE) {
    const weaponGroup = new THREE.Group();

    const gunGeo = new THREE.BoxGeometry(0.08, 0.12, 0.5);
    const gunMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const weaponMesh = new THREE.Mesh(gunGeo, gunMat);
    weaponMesh.position.set(0.25, -0.2, -0.4);
    weaponGroup.add(weaponMesh);

    const barrelGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.3, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.15, -0.7);
    weaponGroup.add(barrel);

    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.3, 2);
    gunLight.position.set(0.25, -0.1, -0.5);
    weaponGroup.add(gunLight);

    return { weaponGroup, weaponMesh, gunLight };
  }

  update(dt, weaponGroup) {
    if (!weaponGroup) return;

    this.state.dt = dt;
    this.state.time += dt;

    const movementMul = this.state.isSprinting ? this.sprintSwayMultiplier : 1;
    const swayX = this.state.isMoving ? this.swayMoveX : this.swayIdleX;
    const swayY = this.state.isMoving ? this.swayMoveY : this.swayIdleY;
    const speed = this.swaySpeed * (this.state.isMoving ? movementMul : 0.6);

    // Base sway
    weaponGroup.position.x = Math.sin(this.state.time * speed) * swayX * movementMul;
    weaponGroup.position.y = Math.cos(this.state.time * speed * 2) * swayY * movementMul;

    // Fire impulse / recovery
    if (this.state.isFiring) {
      this.anim.recoilZ = -this.fireKick;
      this.anim.rotX = this.recoilAmount;
      this.anim.rotZ = (Math.random() - 0.5) * 0.03;
    }

    const recover = Math.min(1, dt * this.recoverySpeed);
    this.anim.recoilZ += (0 - this.anim.recoilZ) * recover;
    this.anim.rotX += (0 - this.anim.rotX) * recover;
    this.anim.rotZ += (0 - this.anim.rotZ) * recover;

    weaponGroup.position.z = this.anim.recoilZ;
    weaponGroup.rotation.x = this.anim.rotX;
    weaponGroup.rotation.z = this.anim.rotZ;

    if (this.state.isReloading) {
      const p = this.state.reloadProgress;
      weaponGroup.rotation.x = -this.reloadTilt * Math.sin(p * Math.PI);
      weaponGroup.rotation.z += 0.2 * Math.sin(p * Math.PI);
    }
  }

  fire(game, camera, scene, audio, props) {
    if (!this.canFire()) return false;

    audio.play(this.sound);

    const mf = document.getElementById('muzzle-flash');
    if (mf) {
      mf.style.opacity = 1;
      setTimeout(() => (mf.style.opacity = 0), 50);
    }

    if (this.type === 'ray' || this.type === 'ray_multi') {
      const pellets = this.pellets || 1;
      for (let i = 0; i < pellets; i++) {
        this.raycastShot(game, camera, props, this.damage, this.spread, this.tracerColor);
      }
    } else if (this.type === 'projectile') {
      this.fireProjectile(game, camera, scene);
    }

    this.consumeAmmo();
    return true;
  }

  raycastShot(game, camera, props, damage, spread, color) {
    const dir = new THREE.Vector3((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, -1);
    if (dir.lengthSq() === 0) return;
    dir.normalize().applyQuaternion(camera.quaternion);

    let closestHit = null;
    let closestDist = Infinity;

    game.enemies.forEach(enemy => {
      if (enemy.state === 'dead') return;
      const toEnemy = enemy.position.clone().sub(camera.position);
      const dist = toEnemy.length();
      if (dist < 0.1 || dist > 100) return;

      const perpDist = camera.position
        .clone()
        .add(dir.clone().multiplyScalar(toEnemy.dot(dir)))
        .sub(enemy.position)
        .length();

      if (perpDist < enemy.size && toEnemy.dot(dir) > 0 && dist < closestDist) {
        closestDist = dist;
        closestHit = enemy;
      }
    });

    if (closestHit) {
      closestHit.takeDamage(damage);
      game.audio.play('hit');
      game.showHitMarker();
      props.spawnParticles(closestHit.position.clone(), 0xff0000, 5);
    }

    const tracerDist = closestHit ? closestDist : 100;
    props.spawnTracer(camera.position.clone(), dir, tracerDist, color);
  }

  fireProjectile(game, camera, scene) {
    const dir = new THREE.Vector3((Math.random() - 0.5) * this.spread, (Math.random() - 0.5) * this.spread, -1)
      .normalize()
      .applyQuaternion(camera.quaternion);

    const projectile = {
      position: camera.position.clone().add(dir.clone().multiplyScalar(1)),
      velocity: dir.clone().multiplyScalar(30),
      damage: this.damage,
      life: 3,
      trail: [],
      weapon: this
    };

    const geo = new THREE.SphereGeometry(0.15, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: this.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(projectile.position);
    scene.add(mesh);
    projectile.mesh = mesh;

    const light = new THREE.PointLight(this.color, 1, 8);
    mesh.add(light);

    game.projectiles.push(projectile);
  }
}
