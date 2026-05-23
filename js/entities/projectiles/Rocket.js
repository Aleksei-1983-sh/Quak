// js/entities/projectiles/Rocket.js

import { Projectile } from './Projectile.js';

export class Rocket extends Projectile {
	constructor(startPos, direction, damage, explosionRadius, muzzleFlashColor, ownerWeapon) {
		// Скорость 28, время жизни 5 секунд, цвет оранжевый
		super(startPos, direction, 28, damage, 5.0, explosionRadius, muzzleFlashColor || 0xff6600);
		this.ownerWeapon = ownerWeapon;
		this.trailTimer = 0;
	}

	// Переопределяем создание модели – детализированная ракета
	_createModel() {
		const group = new THREE.Group();

		// Корпус
		const bodyGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.4, 12);
		const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdd6622, metalness: 0.4, roughness: 0.3 });
		const body = new THREE.Mesh(bodyGeo, bodyMat);
		body.rotation.x = Math.PI / 2;
		group.add(body);

		// Носовой обтекатель
		const noseGeo = new THREE.ConeGeometry(0.09, 0.2, 12);
		const noseMat = new THREE.MeshStandardMaterial({ color: 0xff8844, metalness: 0.2 });
		const nose = new THREE.Mesh(noseGeo, noseMat);
		nose.position.z = -0.28;
		group.add(nose);

		// Стабилизаторы (4 шт.)
		const finMat = new THREE.MeshStandardMaterial({ color: 0xaa5533 });
		for (let i = 0; i < 4; i++) {
			const finGeo = new THREE.BoxGeometry(0.1, 0.02, 0.1);
			const fin = new THREE.Mesh(finGeo, finMat);
			fin.rotation.z = (i * Math.PI) / 2;
			fin.position.z = 0.18;
			fin.position.y = 0.07;
			group.add(fin);
		}

		// Сопло
		const nozzleGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.08, 8);
		const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });
		const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
		nozzle.position.z = 0.24;
		group.add(nozzle);

		// Свечение (эмиссивный шар)
		const glowGeo = new THREE.SphereGeometry(0.06, 8, 8);
		const glowMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 1.2 });
		const glow = new THREE.Mesh(glowGeo, glowMat);
		glow.position.z = 0.27;
		group.add(glow);

		this.mesh = group;
	}

	// Добавляем динамический свет к ракете
	_addLight() {
		const light = new THREE.PointLight(this.color, 1.2, 12);
		this.mesh.add(light);
		this.light = light;
	}

	// Переопределяем update: добавляем вращение, шлейф частиц, свой взрыв
	update(dt, scene, game) {
		if (!this.mesh) return false;

		// Движение
		this.position.addScaledVector(this.velocity, dt);
		this.mesh.position.copy(this.position);
		if (this.light) this.light.position.copy(this.position);

		// Вращение ракеты для реализма
		this.mesh.rotation.z += 0.15;
		this.mesh.rotation.x += 0.08;

		// Шлейф частиц
		this.trailTimer += dt;
		if (this.trailTimer > 0.03) {
			this.trailTimer = 0;
			const backOffset = this.velocity.clone().normalize().multiplyScalar(-0.25);
			const trailPos = this.position.clone().add(backOffset);

			if (game.props && game.props.spawnParticles) {
				game.props.spawnParticles(trailPos, 0xff6600, 3, 0.08);
			} else {
				// Ручное создание простой частицы
				const particleGeo = new THREE.SphereGeometry(0.05, 4, 4);
				const particleMat = new THREE.MeshBasicMaterial({ color: 0xff8844, transparent: true });
				const particle = new THREE.Mesh(particleGeo, particleMat);
				particle.position.copy(trailPos);
				scene.add(particle);
				setTimeout(() => scene.remove(particle), 200);
			}
		}

		// Проверка столкновения с врагами
		let hitEnemy = null;
		for (let enemy of game.enemies) {
			if (enemy.state === 'dead') continue;
			const dist = this.position.distanceTo(enemy.position);
			if (dist < (enemy.size || 0.5) + 0.3) {
				hitEnemy = enemy;
				break;
			}
		}

		// Столкновение со стенами (если есть коллизия)
		let hitWall = false;
		if (game.collision && game.collision.checkCollision(this.position, 0.3)) {
			hitWall = true;
		}

		if (this.life <= 0 || hitEnemy || hitWall) {
			this.explode(scene, game, hitEnemy);
			return false;
		}

		this.life -= dt;
		return true;
	}

	// Переопределённый взрыв с более мощными эффектами
	explode(scene, game, directHitEnemy = null) {
		if (game.audio) game.audio.play('explosion');

		// Яркая вспышка
		const flashGeo = new THREE.SphereGeometry(0.5, 8, 8);
		const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true });
		const flash = new THREE.Mesh(flashGeo, flashMat);
		flash.position.copy(this.position);
		scene.add(flash);
		setTimeout(() => scene.remove(flash), 100);

		// Динамический свет взрыва с затуханием
		const explosionLight = new THREE.PointLight(0xff8844, 1.5, 15);
		explosionLight.position.copy(this.position);
		scene.add(explosionLight);
		let intensity = 1.5;
		const interval = setInterval(() => {
			intensity -= 0.3;
			explosionLight.intensity = intensity;
			if (intensity <= 0) {
				clearInterval(interval);
				scene.remove(explosionLight);
			}
		}, 50);

		// Множество частиц
		for (let i = 0; i < 35; i++) {
			const particleSize = 0.08 + Math.random() * 0.12;
			const particleMat = new THREE.MeshStandardMaterial({
				color: Math.random() > 0.6 ? 0xff6600 : 0xaa3300,
				emissive: 0x442200
			});
			const particle = new THREE.Mesh(new THREE.SphereGeometry(particleSize, 5, 5), particleMat);
			particle.position.copy(this.position);
			const vel = new THREE.Vector3(
				(Math.random() - 0.5) * 4,
				Math.random() * 3,
				(Math.random() - 0.5) * 4
			).normalize().multiplyScalar(2 + Math.random() * 3);
			scene.add(particle);

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

		// Ударная волна (кольцо)
		const ringGeo = new THREE.RingGeometry(0.3, 0.6, 16);
		const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa66, transparent: true, side: THREE.DoubleSide });
		const shockwave = new THREE.Mesh(ringGeo, ringMat);
		shockwave.position.copy(this.position);
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

		// Нанесение урона
		if (this.explosionRadius > 0) {
			for (let enemy of game.enemies) {
				if (enemy.state === 'dead') continue;
				const dist = this.position.distanceTo(enemy.position);
				if (dist < this.explosionRadius) {
					const falloff = Math.max(0.3, 1 - dist / this.explosionRadius);
					const finalDamage = Math.floor(this.damage * falloff);
					enemy.takeDamage(finalDamage);
				}
			}
		}

		if (directHitEnemy && directHitEnemy.state !== 'dead') {
			directHitEnemy.takeDamage(this.damage * 0.5);
		}

		// Тряска камеры (если есть)
		if (game.cameraShake) game.cameraShake(0.3, 0.2);
	}
}
