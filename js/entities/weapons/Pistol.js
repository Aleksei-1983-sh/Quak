// Пистолет - точный полуавтомат
import { Weapon } from './Weapon.js';
import { Rocket } from '../projectiles/index.js';   // путь относительно текущей папки

export class Pistol extends Weapon {
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
        barrelLength: 0.25,
        gripColor: 0x4a3728,
        slideColor: 0x666666,
        frameColor: 0x333333
      }
    });
  }

  // Создать уникальную 3D модель пистолета
  createModel(THREE) {
    const weaponGroup = new THREE.Group();
    
    // Рамка пистолета
    const frameGeo = new THREE.BoxGeometry(0.06, 0.1, 0.3);
    const frameMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.frameColor });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0.25, -0.22, -0.35);
    weaponGroup.add(frame);
    
    // Затвор (slide)
    const slideGeo = new THREE.BoxGeometry(0.065, 0.06, 0.2);
    const slideMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.slideColor });
    const slide = new THREE.Mesh(slideGeo, slideMat);
    slide.position.set(0.25, -0.15, -0.45);
    weaponGroup.add(slide);
    
    // Рукоятка
    const gripGeo = new THREE.BoxGeometry(0.055, 0.12, 0.08);
    const gripMat = new THREE.MeshLambertMaterial({ color: this.modelConfig.gripColor });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.rotation.x = -0.2;
    grip.position.set(0.25, -0.28, -0.25);
    weaponGroup.add(grip);
    
    // Ствол
    const barrelGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.15, 8);
    const barrelMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.15, -0.58);
    weaponGroup.add(barrel);
    
    // Прицельная мушка
    const sightGeo = new THREE.BoxGeometry(0.02, 0.015, 0.02);
    const sightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sight = new THREE.Mesh(sightGeo, sightMat);
    sight.position.set(0.25, -0.11, -0.55);
    weaponGroup.add(sight);
    
    // Свет от выстрела
    const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0.3, 2);
    gunLight.position.set(0.25, -0.12, -0.6);
    weaponGroup.add(gunLight);
    
    return { weaponGroup, weaponMesh: frame, gunLight };
  }
}
