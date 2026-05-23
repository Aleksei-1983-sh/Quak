// Базовый класс для всех снарядов (ракеты, плазма, гранаты и т.д.)
export class Projectile {
	/**
	 * @param {THREE.Vector3} startPos - начальная позиция
	 * @param {THREE.Vector3} direction - нормализованное направление полёта
	 * @param {number} speed - скорость (единиц в секунду)
	 * @param {number} damage - урон при попадании
	 * @param {number} life - время жизни в секундах
	 * @param {number} explosionRadius - радиус взрыва (0 если без взрыва)
	 * @param {number} color - основной цвет (для света и материалов)
	 */
	constructor(startPos, direction, speed, damage, life, explosionRadius = 0, color = 0xff6600) {
		this.position = startPos.clone();
		this.velocity = direction.clone().normalize().multiplyScalar(speed);
		this.damage = damage;
		this.life = life;
		this.explosionRadius = explosionRadius;
		this.color = color;

		this.mesh = null;      // 3D модель снаряда (будет создана в createModel)
		this.light = null;     // динамический источник света (опционально)

		this._createModel();   // вызываем создание модели (переопределяется в наследниках)
		this._addLight();      // вызываем добавление света (если нужно)
	}

	// Создаёт 3D модель снаряда (должен быть переопределён)
	_createModel() {
		// Базовая заглушка – сфера
		const geometry = new THREE.SphereGeometry(0.1, 6, 6);
		const material = new THREE.MeshStandardMaterial({ color: this.color });
		this.mesh = new THREE.Mesh(geometry, material);
	}

	// Добавляет точечный свет к снаряду (можно переопределить или оставить пустым)
	_addLight() {
		// по умолчанию без света
	}

	// Обновление снаряда (вызывается из игрового цикла каждый кадр)
	// Возвращает true, если снаряд должен жить дальше, false – если его пора удалить
	update(dt, scene, game) {
		// Движение
		this.position.addScaledVector(this.velocity, dt);
		if (this.mesh) this.mesh.position.copy(this.position);
		if (this.light) this.light.position.copy(this.position);

		// Уменьшаем время жизни
		this.life -= dt;
		if (this.life <= 0) {
			// Взрыв, если есть радиус
			if (this.explosionRadius > 0) {
				this.explode(scene, game, null);
			}
			return false; // снаряд уничтожается
		}

		// Проверка столкновения с врагами (базовая сферическая)
		let hitEnemy = null;
		for (let enemy of game.enemies) {
			if (enemy.state === 'dead') continue;
			const dist = this.position.distanceTo(enemy.position);
			if (dist < (enemy.size || 0.5) + 0.2) {
				hitEnemy = enemy;
				break;
			}
		}

		if (hitEnemy) {
			if (this.explosionRadius > 0) {
				this.explode(scene, game, hitEnemy);
			} else {
				// Прямое попадание без взрыва
				hitEnemy.takeDamage(this.damage);
				if (game.props && game.props.spawnParticles) {
					game.props.spawnParticles(this.position, 0xff0000, 5);
				}
			}
			return false; // удаляем снаряд
		}

		// Проверка столкновения со стенами (если есть система коллизий)
		if (game.collision && game.collision.checkCollision(this.position, 0.2)) {
			if (this.explosionRadius > 0) {
				this.explode(scene, game, null);
			}
			return false;
		}

		return true; // снаряд продолжает полёт
	}

	// Взрыв (можно переопределить для более эффектных взрывов)
	explode(scene, game, directHitEnemy = null) {
		// Звук взрыва (попробуйте найти в audio)
		if (game.audio) game.audio.play('explosion');

		// Повреждение в радиусе
		if (this.explosionRadius > 0) {
			let hitCount = 0;
			for (let enemy of game.enemies) {
				if (enemy.state === 'dead') continue;
				const dist = this.position.distanceTo(enemy.position);
				if (dist < this.explosionRadius) {
					const falloff = Math.max(0.3, 1 - dist / this.explosionRadius);
					const finalDamage = Math.floor(this.damage * falloff);
					enemy.takeDamage(finalDamage);
					hitCount++;
				}
			}
			if (directHitEnemy && directHitEnemy.state !== 'dead') {
				directHitEnemy.takeDamage(this.damage * 0.5);
			}
		}

		// Визуальный эффект взрыва (сфера + частицы)
		const flashGeo = new THREE.SphereGeometry(0.4, 6, 6);
		const flashMat = new THREE.MeshBasicMaterial({ color: this.color, transparent: true });
		const flash = new THREE.Mesh(flashGeo, flashMat);
		flash.position.copy(this.position);
		scene.add(flash);
		setTimeout(() => scene.remove(flash), 100);

		// Динамический свет
		const light = new THREE.PointLight(this.color, 1.5, 12);
		light.position.copy(this.position);
		scene.add(light);
		setTimeout(() => scene.remove(light), 150);

		// Несколько частиц (если есть система)
		if (game.props && game.props.spawnParticles) {
			for (let i = 0; i < 15; i++) {
				game.props.spawnParticles(this.position, this.color, 3, 0.1);
			}
		}
	}

	// Удаление моделей из сцены (вызывается перед удалением снаряда из массива)
	destroy(scene) {
		if (this.mesh) scene.remove(this.mesh);
		if (this.light) scene.remove(this.light);
	}
}
