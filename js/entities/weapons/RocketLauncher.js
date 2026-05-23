import { Weapon } from './index.js';
import { Rocket } from '../projectiles/index.js';   // путь относительно текущей папки

// Ракетница - оружие с проектильным взрывным уроном (улучшенная графика и эффекты)
export class RocketLauncher extends Weapon {
	constructor() {
		super({
			name: 'ROCKET LAUNCHER',
			type: 'projectile',
			damage: 120,          // увеличен урон
			fireRate: 0.8,
			ammo: 5,
			maxAmmo: 5,
			reloadTime: 2.8,
			spread: 0.008,
			sound: 'rocket_launch',
			color: 0xff5500,
			auto: false,
			icon: '🚀',
			recoilAmount: 0.35,
			fireKick: 0.3,
			recoverySpeed: 5,
			reloadTilt: 0.7,
			muzzleFlashColor: 0xff8800,
			tracerColor: 0xff6600,
			modelConfig: {
				bodyColor: 0x3a5a3a,
				metalColor: 0x888888,
				gripColor: 0x5c3a21,
				darkMetal: 0x444444,
				emissiveColor: 0xff3300
			}
		});
	}

	getExplosionRadius() {
		return 6.5; // увеличен радиус взрыва
	}

	// === УЛУЧШЕННАЯ 3D МОДЕЛЬ РАКЕТНИЦЫ (AAA качество) ===
	createModel(THREE) {
		const group = new THREE.Group();
		const { bodyColor, metalColor, gripColor, darkMetal, emissiveColor } = this.modelConfig;

		// ---- Основной корпус (лафет) ----
		const bodyGeo = new THREE.BoxGeometry(0.11, 0.14, 0.65);
		const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.7, roughness: 0.4 });
		const body = new THREE.Mesh(bodyGeo, bodyMat);
		body.position.set(0.25, -0.16, -0.45);
		group.add(body);

		// ---- Пусковая труба с металлическим блеском ----
		const tubeGeo = new THREE.CylinderGeometry(0.055, 0.058, 0.7, 24);
		const tubeMat = new THREE.MeshStandardMaterial({ color: metalColor, metalness: 0.85, roughness: 0.25 });
		const tube = new THREE.Mesh(tubeGeo, tubeMat);
		tube.rotation.x = Math.PI / 2;
		tube.position.set(0.25, -0.12, -0.6);
		group.add(tube);

		// ---- Дульный тормоз (наконечник) ----
		const muzzleGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.1, 16);
		const muzzleMat = new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.9, roughness: 0.2 });
		const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
		muzzle.rotation.x = Math.PI / 2;
		muzzle.position.set(0.25, -0.12, -0.95);
		group.add(muzzle);

		// ---- Задняя крышка (раструб) ----
		const backGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.12, 16);
		const backMat = new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.8 });
		const back = new THREE.Mesh(backGeo, backMat);
		back.rotation.x = Math.PI / 2;
		back.position.set(0.25, -0.12, -0.2);
		group.add(back);

		// ---- Рукоятка с текстурой (дерево/резина) ----
		const gripGeo = new THREE.BoxGeometry(0.07, 0.16, 0.1);
		const gripMat = new THREE.MeshStandardMaterial({ color: gripColor, roughness: 0.6, metalness: 0.1 });
		const grip = new THREE.Mesh(gripGeo, gripMat);
		grip.rotation.x = -0.2;
		grip.position.set(0.25, -0.29, -0.38);
		group.add(grip);

		// ---- Спусковая скоба и крючок ----
		const triggerGuardGeo = new THREE.TorusGeometry(0.03, 0.006, 8, 24, Math.PI);
		const triggerMat = new THREE.MeshStandardMaterial({ color: 0xaa8866, metalness: 0.5 });
		const triggerGuard = new THREE.Mesh(triggerGuardGeo, triggerMat);
		triggerGuard.rotation.y = Math.PI / 2;
		triggerGuard.rotation.x = 0.2;
		triggerGuard.position.set(0.25, -0.23, -0.44);
		group.add(triggerGuard);

		const triggerGeo = new THREE.BoxGeometry(0.012, 0.03, 0.008);
		const trigger = new THREE.Mesh(triggerGeo, triggerMat);
		trigger.position.set(0.25, -0.25, -0.44);
		group.add(trigger);

		// ---- Прицел (оптический с красной точкой) ----
		const scopeBaseGeo = new THREE.BoxGeometry(0.05, 0.04, 0.08);
		const scopeMat = new THREE.MeshStandardMaterial({ color: darkMetal, metalness: 0.7 });
		const scopeBase = new THREE.Mesh(scopeBaseGeo, scopeMat);
		scopeBase.position.set(0.25, -0.07, -0.48);
		group.add(scopeBase);

		const scopeTubeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.14, 12);
		const scopeTube = new THREE.Mesh(scopeTubeGeo, scopeMat);
		scopeTube.rotation.x = Math.PI / 2;
		scopeTube.position.set(0.25, -0.05, -0.48);
		group.add(scopeTube);

		// Красная точка (эмиссивная)
		const dotGeo = new THREE.SphereGeometry(0.008, 8, 8);
		const dotMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff2200, emissiveIntensity: 1.2 });
		const redDot = new THREE.Mesh(dotGeo, dotMat);
		redDot.position.set(0.25, -0.05, -0.41);
		group.add(redDot);

		// ---- Передняя рукоятка (для устойчивости) ----
		const foregripGeo = new THREE.BoxGeometry(0.05, 0.1, 0.08);
		const foregripMat = new THREE.MeshStandardMaterial({ color: gripColor, roughness: 0.7 });
		const foregrip = new THREE.Mesh(foregripGeo, foregripMat);
		foregrip.position.set(0.25, -0.27, -0.75);
		group.add(foregrip);

		// ---- Крепление ремня ----
		const strapRingGeo = new THREE.TorusGeometry(0.015, 0.004, 6, 16);
		const ringMat = new THREE.MeshStandardMaterial({ color: 0xccccaa, metalness: 0.6 });
		const ring = new THREE.Mesh(strapRingGeo, ringMat);
		ring.rotation.x = Math.PI / 2;
		ring.position.set(0.25, -0.05, -0.2);
		group.add(ring);

		// ---- Светодиодный индикатор заряда (эмиссив) ----
		const ledGeo = new THREE.SphereGeometry(0.008, 6, 6);
		const ledMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00aa44, emissiveIntensity: 0.8 });
		const led = new THREE.Mesh(ledGeo, ledMat);
		led.position.set(0.25, -0.09, -0.65);
		group.add(led);

		// ---- Динамический свет на дуле (будет включаться при выстреле) ----
		const gunLight = new THREE.PointLight(this.muzzleFlashColor, 0, 5);
		gunLight.position.set(0.25, -0.12, -0.95);
		group.add(gunLight);
		this.muzzleLight = gunLight; // сохраняем для анимации

		// ---- Дополнительный свет на корпусе (декоративный) ----
		const ambientLight = new THREE.PointLight(0xaa8866, 0.3, 3);
		ambientLight.position.set(0.25, -0.1, -0.5);
		group.add(ambientLight);

		return { weaponGroup: group, weaponMesh: tube, gunLight };
	}

	// === ПЕРЕОПРЕДЕЛЕНИЕ ВЫСТРЕЛА: ракета с продвинутой анимацией и эффектами ===
	fireProjectile(game, camera, scene) {
		// Направление с разбросом
		const dir = new THREE.Vector3(
			(Math.random() - 0.5) * this.spread,
			(Math.random() - 0.5) * this.spread,
			-1
		).normalize().applyQuaternion(camera.quaternion);

		const startPos = camera.position.clone().add(dir.clone().multiplyScalar(1.0));

		// Вспышка выстрела (оставляем)
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

		// Создаём ракету через класс
		const rocket = new Rocket(startPos, dir, this.damage, this.getExplosionRadius(), this.muzzleFlashColor, this);
		scene.add(rocket.mesh);
		if (rocket.light) scene.add(rocket.light);
		game.projectiles.push(rocket);
	}
	// === ЭФФЕКТ ВЗРЫВА (частицы, свет, ударная волна, урон) ===
	createExplosion(position, radius, damage, scene, game, directHitEnemy = null) {
		// Звук взрыва
		game.audio.play('explosion');

		// 1. Яркая вспышка (сфера, исчезающая)
		const flashGeo = new THREE.SphereGeometry(0.5, 8, 8);
		const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true });
		const flash = new THREE.Mesh(flashGeo, flashMat);
		flash.position.copy(position);
		scene.add(flash);
		setTimeout(() => scene.remove(flash), 100);

		// 2. Динамический свет взрыва
		const explosionLight = new THREE.PointLight(0xff8844, 1.5, 15);
		explosionLight.position.copy(position);
		scene.add(explosionLight);
		// Пульсация света
		let intensity = 1.5;
		const interval = setInterval(() => {
			intensity -= 0.3;
			explosionLight.intensity = intensity;
			if (intensity <= 0) {
				clearInterval(interval);
				scene.remove(explosionLight);
			}
		}, 50);

		// 3. Частицы дыма и огня (множество)
		for (let i = 0; i < 35; i++) {
			const particleSize = 0.08 + Math.random() * 0.12;
			const particleMat = new THREE.MeshStandardMaterial({
				color: Math.random() > 0.6 ? 0xff6600 : 0xaa3300,
				emissive: 0x442200
			});
			const particle = new THREE.Mesh(new THREE.SphereGeometry(particleSize, 5, 5), particleMat);
			particle.position.copy(position);
			// Случайное направление разлета
			const vel = new THREE.Vector3(
				(Math.random() - 0.5) * 4,
				Math.random() * 3,
				(Math.random() - 0.5) * 4
			).normalize().multiplyScalar(2 + Math.random() * 3);
			scene.add(particle);

			// Анимация частицы (простое перемещение и исчезновение)
			let life = 1.0;
			const updateParticle = () => {
				life -= 0.05;
				if (life <= 0) {
					scene.remove(particle);
					return;
				}
				particle.position.add(vel.clone().multiplyScalar(0.1));
				particle.material.transparent = true;
				particle.material.opacity = life;
				particle.scale.setScalar(0.8 + life * 0.5);
				requestAnimationFrame(updateParticle);
			};
			requestAnimationFrame(updateParticle);
		}

		// 4. Ударная волна (расширяющееся кольцо)
		const ringGeo = new THREE.RingGeometry(0.3, 0.6, 16);
		const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa66, transparent: true, side: THREE.DoubleSide });
		const shockwave = new THREE.Mesh(ringGeo, ringMat);
		shockwave.position.copy(position);
		shockwave.lookAt(0, 1, 0);
		scene.add(shockwave);

		let scale = 1;
		const expandRing = () => {
			scale += 0.25;
			shockwave.scale.set(scale, scale, 1);
			ringMat.opacity -= 0.05;
			if (ringMat.opacity <= 0) {
				scene.remove(shockwave);
				return;
			}
			requestAnimationFrame(expandRing);
		};
		requestAnimationFrame(expandRing);

		// 5. Нанесение урона врагам в радиусе
		let hitCount = 0;
		for (let enemy of game.enemies) {
			if (enemy.state === 'dead') continue;
			const dist = position.distanceTo(enemy.position);
			if (dist < radius) {
				// Урон падает с расстоянием
				const falloff = Math.max(0.3, 1 - dist / radius);
				const finalDamage = Math.floor(damage * falloff);
				enemy.takeDamage(finalDamage);
				hitCount++;
				// Эффект попадания на враге
				if (game.props && game.props.spawnParticles) {
					game.props.spawnParticles(enemy.position, 0xff3300, 5, 0.1);
				}
			}
		}

		// Если прямой хит по врагу – дополнительный эффект
		if (directHitEnemy && directHitEnemy.state !== 'dead') {
			directHitEnemy.takeDamage(damage * 0.5); // бонусный урон
			game.showHitMarker();
		}

		// Вибрация камеры (если есть)
		if (game.cameraShake) game.cameraShake(0.3, 0.2);
	}
}
