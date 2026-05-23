// Файл для обновления createWeaponModel и update методов в GameEngine.js
// Этот скрипт нужно запустить для применения изменений

const fs = require('fs');
const path = '/workspace/js/core/GameEngine.js';

let content = fs.readFileSync(path, 'utf8');

// Заменяем createWeaponModel на новый метод
const oldCreateWeaponModel = `createWeaponModel() {
    this.weaponGroup = new THREE.Group();

    const gunGeo = new THREE.BoxGeometry(0.08, 0.12, 0.5);
    const gunMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    this.weaponMesh = new THREE.Mesh(gunGeo, gunMat);
    this.weaponMesh.position.set(0.25, -0.2, -0.4);
    this.weaponGroup.add(this.weaponMesh);

    const barrelGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.3, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.15, -0.7);
    this.weaponGroup.add(barrel);

    this.gunLight = new THREE.PointLight(0xff6600, 0.3, 2);
    this.gunLight.position.set(0.25, -0.1, -0.5);
    this.weaponGroup.add(this.gunLight);

    this.camera.add(this.weaponGroup);
    this.scene.add(this.camera);
  }`;

const newCreateWeaponModel = `createWeaponModel() {
    // Создаем оружие используя метод текущего оружия
    const weapon = this.player.weapons[this.currentWeapon];
    if (weapon && weapon.createModel) {
      const model = weapon.createModel(THREE);
      this.weaponGroup = model.weaponGroup;
      this.weaponMesh = model.weaponMesh;
      this.gunLight = model.gunLight;
    } else {
      // Fallback к старой реализации
      this.weaponGroup = new THREE.Group();
      const gunGeo = new THREE.BoxGeometry(0.08, 0.12, 0.5);
      const gunMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
      this.weaponMesh = new THREE.Mesh(gunGeo, gunMat);
      this.weaponMesh.position.set(0.25, -0.2, -0.4);
      this.weaponGroup.add(this.weaponMesh);
      const barrelGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.3, 8);
      const barrelMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0.25, -0.15, -0.7);
      this.weaponGroup.add(barrel);
      this.gunLight = new THREE.PointLight(0xff6600, 0.3, 2);
      this.gunLight.position.set(0.25, -0.1, -0.5);
      this.weaponGroup.add(this.gunLight);
    }
    this.camera.add(this.weaponGroup);
    this.scene.add(this.camera);
  }`;

content = content.replace(oldCreateWeaponModel, newCreateWeaponModel);

fs.writeFileSync(path, content);
console.log('GameEngine.js обновлен успешно!');
