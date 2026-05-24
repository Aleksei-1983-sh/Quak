import { Weapon } from './Weapon.js';
import { Rocket } from '../projectiles/index.js';
// --------------------------- ОСНОВНОЙ КЛАСС ---------------------------
export class RocketLauncher extends Weapon {
	constructor() {
		super({
			name: 'ROCKET LAUNCHER',
			type: 'projectile',
			damage: 120,
			fireRate: 0.8,
			ammo: 5,
			maxAmmo: 5,
			reloadTime: 2.8,
			spread: 0.008,
			sound: 'rocket_launch',
			auto: false,
			icon: '🚀',
			recoilAmount: 0.1,
			fireKick: 0.5,
			recoverySpeed: 5,        // Как быстро возвращается назад
			recoverySpeed: 10,
			reloadTilt: 0.7,
			modelConfig: {
				muzzleFlashColor: 0xff8800,
				tracerColor: 0xff6600,
				color: 0xff5500,
				bodyColor: 0x3a5a3a,
				metalColor: 0x888888,
				gripColor: 0x5c3a21,
				darkMetal: 0x444444,
				triggerColor: 0x2d2d2d,
				emissiveColor: 0xff3300
			}
		});
	}

	getExplosionRadius() {
		return 6.5;
	}

	createModel(THREE) {
		const group = new THREE.Group();
		const cfg = this.modelConfig;

		group.add(this.createBarrel(THREE, cfg));
		group.add(this.createBody(THREE, cfg));
		group.add(this.createStock(THREE, cfg));
		group.add(this.createGrip(THREE, cfg));
		group.add(this.createForegrip(THREE, cfg));
		group.add(this.createScope(THREE, cfg));
		group.add(this.createAccessories(THREE, cfg));

		const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0, 5);
		gunLight.position.set(0.25, -0.12, -0.95);
		group.add(gunLight);
		this.muzzleLight = gunLight;

		const ambientLight = new THREE.PointLight(0xaa8866, 0.3, 3);
		ambientLight.position.set(0.25, -0.1, -0.5);
		group.add(ambientLight);

		return { weaponGroup: group, weaponMesh: group.children[0], gunLight };
	}

	createBarrel(THREE, cfg) {
		const group = new THREE.Group();
		const { metalColor, darkMetal } = cfg;

		const tubeGeo = new THREE.CylinderGeometry(0.055, 0.058, 0.7, 24);
		const tubeMat = new THREE.MeshStandardMaterial({ color: metalColor, metalness: 0.85, roughness: 0.25 });
		const tube = new THREE.Mesh(tubeGeo, tubeMat);
		tube.rotation.x = Math.PI / 2;
		tube.position.set(0.25, -0.12, -0.6);
		group.add(tube);

		const muzzleGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.1, 16);
		const muzzleMat = new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.9, roughness: 0.2 });
		const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
		muzzle.rotation.x = Math.PI / 2;
		muzzle.position.set(0.25, -0.12, -0.95);
		group.add(muzzle);

		const backGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.12, 16);
		const backMat = new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.8 });
		const back = new THREE.Mesh(backGeo, backMat);
		back.rotation.x = Math.PI / 2;
		back.position.set(0.25, -0.12, -0.2);
		group.add(back);

		return group;
	}

	createBody(THREE, cfg) {
		const group = new THREE.Group();
		const { bodyColor } = cfg;
		const bodyGeo = new THREE.BoxGeometry(0.11, 0.14, 0.65);
		const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7, roughness: 0.4 });
		const body = new THREE.Mesh(bodyGeo, bodyMat);
		body.position.set(0.25, -0.16, -0.45);
		group.add(body);
		return group;
	}

	createStock(THREE, cfg) {
		const group = new THREE.Group();
		const { gripColor, darkMetal } = cfg;

		const stockGeo = new THREE.BoxGeometry(0.1, 0.12, 0.35);
		const stockMat = new THREE.MeshStandardMaterial({ color: gripColor, roughness: 0.6, metalness: 0.2 });
		const stock = new THREE.Mesh(stockGeo, stockMat);
		stock.position.set(0.25, -0.17, -0.05);
		stock.rotation.x = -0.05;
		group.add(stock);

		const buttGeo = new THREE.BoxGeometry(0.11, 0.14, 0.05);
		const buttMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.05 });
		const butt = new THREE.Mesh(buttGeo, buttMat);
		butt.position.set(0.25, -0.17, 0.12);
		group.add(butt);

		const cheekGeo = new THREE.BoxGeometry(0.06, 0.04, 0.2);
		const cheekMat = new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.5 });
		const cheek = new THREE.Mesh(cheekGeo, cheekMat);
		cheek.position.set(0.25, -0.08, 0.0);
		group.add(cheek);

		const ringGeo = new THREE.TorusGeometry(0.045, 0.008, 8, 24);
		const ringMat = new THREE.MeshStandardMaterial({ color: 0xccccaa, metalness: 0.4 });
		const ring = new THREE.Mesh(ringGeo, ringMat);
		ring.rotation.x = Math.PI / 2;
		ring.position.set(0.25, -0.12, 0.1);
		group.add(ring);

		return group;
	}

	createGrip(THREE, cfg) {
		const group = new THREE.Group();
		const { gripColor, triggerColor } = cfg;

		const gripGeo = new THREE.BoxGeometry(0.07, 0.16, 0.1);
		const gripMat = new THREE.MeshStandardMaterial({ color: gripColor, roughness: 0.6, metalness: 0.1 });
		const grip = new THREE.Mesh(gripGeo, gripMat);
		grip.rotation.x = -0.2;
		grip.position.set(0.25, -0.29, -0.38);
		group.add(grip);

		const stripeGeo = new THREE.BoxGeometry(0.06, 0.08, 0.02);
		const stripeMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3 });
		const stripe = new THREE.Mesh(stripeGeo, stripeMat);
		stripe.position.set(0.25, -0.285, -0.38);
		group.add(stripe);

		const guardGeo = new THREE.TorusGeometry(0.03, 0.006, 8, 24, Math.PI);
		const guardMat = new THREE.MeshStandardMaterial({ color: 0xaa8866, metalness: 0.5 });
		const triggerGuard = new THREE.Mesh(guardGeo, guardMat);
		triggerGuard.rotation.y = Math.PI / 2;
		triggerGuard.rotation.x = 0.2;
		triggerGuard.position.set(0.25, -0.23, -0.44);
		group.add(triggerGuard);

		const triggerGeo = new THREE.BoxGeometry(0.012, 0.03, 0.008);
		const triggerMat = new THREE.MeshStandardMaterial({ color: triggerColor, metalness: 0.6 });
		const trigger = new THREE.Mesh(triggerGeo, triggerMat);
		trigger.position.set(0.25, -0.25, -0.44);
		group.add(trigger);

		return group;
	}

	createForegrip(THREE, cfg) {
		const group = new THREE.Group();
		const { gripColor } = cfg;

		const foregripGeo = new THREE.BoxGeometry(0.05, 0.1, 0.08);
		const foregripMat = new THREE.MeshStandardMaterial({ color: gripColor, roughness: 0.7 });
		const foregrip = new THREE.Mesh(foregripGeo, foregripMat);
		foregrip.position.set(0.25, -0.27, -0.75);
		group.add(foregrip);

		for (let i = 0; i < 3; i++) {
			const grooveGeo = new THREE.BoxGeometry(0.04, 0.02, 0.005);
			const grooveMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
			const groove = new THREE.Mesh(grooveGeo, grooveMat);
			groove.position.set(0.25, -0.25 + i * 0.02, -0.75);
			group.add(groove);
		}

		return group;
	}

	createScope(THREE, cfg) {
		const group = new THREE.Group();
		const { darkMetal } = cfg;

		const baseGeo = new THREE.BoxGeometry(0.05, 0.04, 0.08);
		const baseMat = new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.7 });
		const base = new THREE.Mesh(baseGeo, baseMat);
		base.position.set(0.25, -0.07, -0.48);
		group.add(base);

		const tubeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.14, 12);
		const tubeMat = new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.7 });
		const scopeTube = new THREE.Mesh(tubeGeo, tubeMat);
		scopeTube.rotation.x = Math.PI / 2;
		scopeTube.position.set(0.25, -0.05, -0.48);
		group.add(scopeTube);

		const dotGeo = new THREE.SphereGeometry(0.008, 8, 8);
		const dotMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff2200, emissiveIntensity: 1.2 });
		const redDot = new THREE.Mesh(dotGeo, dotMat);
		redDot.position.set(0.25, -0.05, -0.41);
		group.add(redDot);

		const capGeo = new THREE.CylinderGeometry(0.022, 0.024, 0.01, 8);
		const capMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
		const capFront = new THREE.Mesh(capGeo, capMat);
		capFront.rotation.x = Math.PI / 2;
		capFront.position.set(0.25, -0.05, -0.55);
		group.add(capFront);

		return group;
	}

	createAccessories(THREE, cfg) {
		const group = new THREE.Group();
		const { darkMetal } = cfg;

		const ringGeo = new THREE.TorusGeometry(0.015, 0.004, 6, 16);
		const ringMat = new THREE.MeshStandardMaterial({ color: 0xccccaa, metalness: 0.6 });
		const ring = new THREE.Mesh(ringGeo, ringMat);
		ring.rotation.x = Math.PI / 2;
		ring.position.set(0.25, -0.05, -0.2);
		group.add(ring);

		const ledGeo = new THREE.SphereGeometry(0.008, 6, 6);
		const ledMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00aa44, emissiveIntensity: 0.8 });
		const led = new THREE.Mesh(ledGeo, ledMat);
		led.position.set(0.25, -0.09, -0.65);
		group.add(led);

		const railGeo = new THREE.BoxGeometry(0.08, 0.02, 0.04);
		const railMat = new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.7 });
		const topRail = new THREE.Mesh(railGeo, railMat);
		topRail.position.set(0.25, -0.04, -0.45);
		group.add(topRail);

		return group;
	}

	fireProjectile(game, camera, scene) {
		// Здесь должна быть реализация выстрела с использованием класса Rocket
		// Если вы ещё не перенесли класс Rocket, временно оставьте старую логику
		// Ниже пример использования класса Rocket (если он подключён)
		const dir = new THREE.Vector3(
			(Math.random() - 0.5) * this.spread,
			(Math.random() - 0.5) * this.spread,
			-1
		).normalize().applyQuaternion(camera.quaternion);

		const spawnOffset = dir.clone().multiplyScalar(1.0);
		const startPos = camera.position.clone().add(spawnOffset);

		// Вспышка
		const flashGeo = new THREE.SphereGeometry(0.12, 6, 6);
		const flashMat = new THREE.MeshBasicMaterial({ color: this.muzzleFlashColor, transparent: true, opacity: 0.9 });
		const flashMesh = new THREE.Mesh(flashGeo, flashMat);
		flashMesh.position.copy(startPos);
		scene.add(flashMesh);
		setTimeout(() => scene.remove(flashMesh), 80);

		if (this.muzzleLight) {
			this.muzzleLight.intensity = 1.8;
			setTimeout(() => { if (this.muzzleLight) this.muzzleLight.intensity = 0; }, 100);
		}

		game.audio.play(this.sound);

		// Если класс Rocket уже определён (например, в projectiles/Rocket.js), используем его
		if (typeof Rocket !== 'undefined') {
			const rocket = new Rocket(startPos, dir, this.damage, this.getExplosionRadius(), this.muzzleFlashColor, this);
			scene.add(rocket.mesh);
			if (rocket.light) scene.add(rocket.light);
			game.projectiles.push(rocket);
		} else {
			// fallback: старая логика (объект с update)
			const rocket = {
				position: startPos,
				velocity: dir.clone().multiplyScalar(28),
				damage: this.damage,
				life: 5.0,
				weapon: this,
				explosionRadius: this.getExplosionRadius(),
				mesh: null,
				light: null,
				trailTimer: 0,
				update: (dt, scene, game) => {
					// ... (старая реализация)
					return true;
				}
			};
			// Создать mesh ракеты и добавить
			const rocketGroup = new THREE.Group();
			// ... (код создания модели ракеты)
			rocket.mesh = rocketGroup;
			scene.add(rocket.mesh);
			game.projectiles.push(rocket);
		}
	}
}
