// Базовый класс для всех видов оружия
import { Rocket } from '../projectiles/index.js';   // путь относительно текущей папки
/**
 * ═══════════════════════════════════════════════════════════════
 * 🎮 WEAPON ANIMATION CONFIG — ШПАРГАЛКА РАЗРАБОТЧИКА
 * ═══════════════════════════════════════════════════════════════
 * 
 * 🔫 ОТДАЧА (RECOIL)
 * ───────────────────────────────────────────────────────────────
 * recoilAmount: 0.1
 *   • Подброс ствола вверх при выстреле (в радианах)
 *   • 0.05 = пистолет | 0.1 = автомат | 0.2+ = дробовик/ракетница
 * 
 * fireKick: 0.12
 *   • Откат оружия назад по оси Z (к камере)
 *   • Создаёт ощущение "удара в плечо"
 *   • Обычно = recoilAmount × 1.2
 * 
 * recoverySpeed: 10
 *   • Скорость возврата оружия в исходное положение (ед./сек)
 *   • 15-20 = быстрое (пистолет) | 8-12 = среднее | 4-6 = тяжёлое
 *   • Формула: время восстановления ≈ 1 / recoverySpeed
 * 
 * 
 * 🌊 ПОКАЧИВАНИЕ (SWAY) — имитация инерции и дыхания
 * ───────────────────────────────────────────────────────────────
 * swayIdleX: 0.006, swayIdleY: 0.004
 *   • Амплитуда покачивания, когда персонаж стоит на месте
 *   • Очень малые значения = едва заметное "дыхание"
 * 
 * swayMoveX: 0.015, swayMoveY: 0.01
 *   • Амплитуда при обычном движении (ходьба)
 *   • Обычно в 2-3 раза больше, чем swayIdle
 * 
 * swaySpeed: 8
 *   • Скорость колебаний в радианах/секунду
 *   • 8 рад/сек ≈ 1.3 колебания в секунду (ритм шагов)
 *   • ↑ значение = более "нервное" покачивание
 * 
 * sprintSwayMultiplier: 1.4
 *   • Множитель усиления при спринте
 *   • Применяется к: swayMoveX/Y и swaySpeed
 *   • 1.3-1.6 = заметная разница между ходьбой и бегом
 * 
 * 
 * 🔄 ПЕРЕЗАРЯДКА
 * ───────────────────────────────────────────────────────────────
 * reloadTilt: 0.35
 *   • Максимальный наклон оружия при перезарядке (в радианах)
 *   • 0.35 рад ≈ 20° — выразительный, но не чрезмерный жест
 *   • Анимация идёт по дуге: 0° → 20° → 0° через sin(π·progress)
 * 
 * 
 * ═══════════════════════════════════════════════════════════════
 * 🎯 ПРЕСЕТЫ ДЛЯ РАЗНЫХ ТИПОВ ОРУЖИЯ (скопируйте и настройте)
 * ═══════════════════════════════════════════════════════════════
 * 
 * // 🔫 ПИСТОЛЕТ — лёгкий, быстрый, отзывчивый
 * {
 *   recoilAmount: 0.05, fireKick: 0.06, recoverySpeed: 15,
 *   swayIdleX: 0.004, swayIdleY: 0.003,
 *   swayMoveX: 0.01,  swayMoveY: 0.007,
 *   swaySpeed: 10, sprintSwayMultiplier: 1.3,
 *   reloadTilt: 0.2
 * }
 * 
 * // 🔫 АВТОМАТ — сбалансированный, универсальный
 * {
 *   recoilAmount: 0.1, fireKick: 0.12, recoverySpeed: 10,
 *   swayIdleX: 0.006, swayIdleY: 0.004,
 *   swayMoveX: 0.015, swayMoveY: 0.01,
 *   swaySpeed: 8, sprintSwayMultiplier: 1.4,
 *   reloadTilt: 0.35
* }
* 
* // 🔫 ДРОБОВИК — тяжёлый, мощный, с отдачей
* {
	*   recoilAmount: 0.2, fireKick: 0.25, recoverySpeed: 6,
		*   swayIdleX: 0.008, swayIdleY: 0.005,
		*   swayMoveX: 0.02,  swayMoveY: 0.015,
		*   swaySpeed: 6, sprintSwayMultiplier: 1.5,
		*   reloadTilt: 0.4
			* }
			* 
			* // 🚀 РАКЕТНИЦА — очень тяжёлый, медленный, кинематографичный
			* {
				*   recoilAmount: 0.25, fireKick: 0.3, recoverySpeed: 4,
					*   swayIdleX: 0.005, swayIdleY: 0.003,  // меньше качается — тяжёлый
					*   swayMoveX: 0.01,  swayMoveY: 0.007,
					*   swaySpeed: 5, sprintSwayMultiplier: 1.2,  // менее чувствителен к бегу
					*   reloadTilt: 0.5  // выразительная анимация перезарядки
						* }
						* 
						* // 🎯 СНАЙПЕРСКАЯ ВИНТОВКА — стабильный, точный
						* {
							*   recoilAmount: 0.15, fireKick: 0.1, recoverySpeed: 20,  // быстро "усаживается"
								*   swayIdleX: 0.003, swayIdleY: 0.002,  // минимальное покачивание
								*   swayMoveX: 0.008, swayMoveY: 0.005,
								*   swaySpeed: 7, sprintSwayMultiplier: 1.3,
								*   reloadTilt: 0.3
									* }
									* 
									* 
									* ═══════════════════════════════════════════════════════════════
									* ⚡ БЫСТРЫЕ СОВЕТЫ ПО НАСТРОЙКЕ
									* ═══════════════════════════════════════════════════════════════
									* 
									* ✅ Оружие кажется "ватным"?
									*    → ↑ recoverySpeed, ↓ recoilAmount
									* 
									* ✅ Нет ощущения веса?
									*    → ↑ fireKick, ↓ recoverySpeed, ↑ swayMoveX/Y
									* 
									* ✅ Невозможно прицелиться при беге?
									*    → ↓ sprintSwayMultiplier (до 1.2), ↓ swayMoveX/Y
									* 
									* ✅ Перезарядка выглядит скучно?
									*    → ↑ reloadTilt, добавьте звук + частицы
									* 
									* ✅ Разница между ходьбой/бегом незаметна?
									*    → Увеличьте разрыв: swayMoveX / swayIdleX ≥ 2.5
									*    → sprintSwayMultiplier ≥ 1.3
									* 
									* 
									* ═══════════════════════════════════════════════════════════════
									* 🧪 ФОРМУЛЫ И КОНВЕРТАЦИИ
									* ═══════════════════════════════════════════════════════════════
									* 
									* Радианы ↔ Градусы:
	*   deg = rad * (180 / Math.PI)   // 0.35 рад ≈ 20°
*   rad = deg * (Math.PI / 180)   // 30° ≈ 0.52 рад
	* 
	* Время восстановления (сек):
	*   t ≈ 3 / recoverySpeed   // при recoverySpeed=10 → ~0.3 сек
	* 
	* Частота колебаний (Гц):
*   Hz = swaySpeed / (2 * Math.PI)  // swaySpeed=8 → ~1.27 Гц
	* 
	* Амплитуда при спринте:
	*   actualSway = swayMoveX * sprintSwayMultiplier
	* 
	* 
	* ═══════════════════════════════════════════════════════════════
	* 🐛 ОТЛАДКА: если анимация "не работает"
	* ═══════════════════════════════════════════════════════════════
	* 
	* 1. Оружие не качается?
	*    → Проверьте: state.isMoving / isSprinting обновляются?
	*    → Увеличьте swayMoveX в 10 раз для теста
	* 
	* 2. Отдача не видна?
	*    → Проверьте: state.isFiring сбрасывается после выстрела?
	*    → Временно поставьте recoilAmount = 0.5 для визуальной проверки
	* 
	* 3. Перезарядка "дёргается"?
	*    → Убедитесь: reloadProgress плавно меняется 0→1
	*    → Проверьте: анимация не прерывается раньше времени
	* 
	* 4. Анимация зависит от FPS?
*    → Все расчёты должны использовать dt (delta time)
	*    → Проверьте: recoverySpeed применяется как (dt * speed)
	* 
	* ═══════════════════════════════════════════════════════════════
	*/

export class Weapon {
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
			// 🔫 ОТДАЧА
			fireKick: 0.12,           // НАСКОЛЬКО сильно откат (амплитуда)
			recoilSpeed: 25,          // КАК БЫСТРО происходит откат (ед./сек) ⚡ НОВОЕ!
			recoverySpeed: 10,        // Как быстро возвращается назад
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
			isFiring: false,        // текущее состояние кнопки
			lastFireTime: 0,        // время последнего выстрела

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
			rotZ: 0,
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
	// Проверка возможности стрельбы
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

	// === МЕТОДЫ ОТРИСОВКИ ОРУЖИЯ ===

	// Создать 3D модель оружия (переопределяется в наследниках)
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

	//---------------------------------------------------start-updata ---------------------------------
	// ===== ГЛАВНЫЙ МЕТОД (оркестратор) =====
	update(dt, weaponGroup) {
		if (!weaponGroup) return;
		// 1. Обновляем время
		this.state.dt = dt;
		this.state.time += dt;

		// 2. Применяем покачивание (зависит от состояния движения)
		Weapon.applySway(weaponGroup, this.state, this.getConfig());

		// 3. Обрабатываем отдачу и восстановление
		Weapon.handleRecoil(weaponGroup, this.anim, this.state, dt, this.getRecoilConfig());

		// 4. Применяем анимацию перезарядки, если нужно
		if (this.state.isReloading) {
			Weapon.applyReload(weaponGroup, this.state, this.getReloadConfig());
		}
	}

	// ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ (конфигурация) =====
	getConfig() {
		return {
			swayIdleX: this.swayIdleX, swayIdleY: this.swayIdleY,
			swayMoveX: this.swayMoveX, swayMoveY: this.swayMoveY,
			swaySpeed: this.swaySpeed,
			sprintSwayMultiplier: this.sprintSwayMultiplier,
		};
	}

	getRecoilConfig() {
		return {
			fireRate: this.fireRate,
			fireKick: this.fireKick,
			recoilAmount: this.recoilAmount,
			recoilSpeed: this.recoilSpeed,
			recoverySpeed: this.recoverySpeed,
		};
	}

	getReloadConfig() {
		return { reloadTilt: this.reloadTilt };
	}

	/**
	 * Плавное покачивание, когда персонаж не движется
	 */
	static applyIdleSway(weaponGroup, state, config) {
		const base = weaponGroup.userData?.basePosition;
		const speed = config.swaySpeed * 0.6; // медленнее
		const baseX = base ? base.x : 0;
		const baseY = base ? base.y : 0;
		weaponGroup.position.x = baseX + Math.sin(state.time * speed) * config.swayIdleX;
		weaponGroup.position.y = baseY + Math.cos(state.time * speed * 2) * config.swayIdleY;
	}

	/**
	 * Умеренное покачивание при обычном движении
	 */
	static applyWalkingSway(weaponGroup, state, config) {
		const base = weaponGroup.userData?.basePosition;
		const speed = config.swaySpeed;
		const baseX = base ? base.x : 0;
		const baseY = base ? base.y : 0;
		weaponGroup.position.x = baseX + Math.sin(state.time * speed) * config.swayMoveX;
		weaponGroup.position.y = baseY + Math.cos(state.time * speed * 2) * config.swayMoveY;
	}

	/**
	 * Интенсивное покачивание при беге
	 */
	static applySprintSway(weaponGroup, state, config) {
		const base = weaponGroup.userData?.basePosition;
		const mul = config.sprintSwayMultiplier;
		const speed = config.swaySpeed * mul;
		const baseX = base ? base.x : 0;
		const baseY = base ? base.y : 0;
		weaponGroup.position.x = baseX + Math.sin(state.time * speed) * config.swayMoveX * mul;
		weaponGroup.position.y = baseY + Math.cos(state.time * speed * 2) * config.swayMoveY * mul;
	}

	/**
	 * Выбирает и применяет нужный тип покачивания в зависимости от состояния
	 */
	static applySway(weaponGroup, state, config) {
		if (state.isSprinting) {
			Weapon.applySprintSway(weaponGroup, state, config);
		} else if (state.isMoving) {
			Weapon.applyWalkingSway(weaponGroup, state, config);
		} else {
			Weapon.applyIdleSway(weaponGroup, state, config);
		}
	}

	/**
	 * 🔍 Отладка: показывает направление оружия
	 * @param {THREE.Object3D} weaponGroup - группа оружия
	 */
	static debugDirection(weaponGroup) {
		if (!weaponGroup) return;

		const forward = new THREE.Vector3();
		weaponGroup.getWorldDirection(forward);

		console.log('🧭 Оружие смотрит:', {
			x: forward.x.toFixed(3),
			y: forward.y.toFixed(3),
			z: forward.z.toFixed(3)
		});

		// Подсказка для отладки отдачи:
		if (forward.z < -0.9) {
			console.log('💡 Оружие смотрит по -Z → отдача по +Z будет "к игроку"');
		} else if (forward.z > 0.9) {
			console.log('💡 Оружие смотрит по +Z → отдача по -Z будет "к игроку"');
		}

		return forward;
	}

	/**
	 * Применяет отдачу при выстреле и плавное восстановление
	 */
	static handleRecoil(weaponGroup, anim, state, dt, config) {
		const basePos = weaponGroup.userData?.basePosition;
		const baseRot = weaponGroup.userData?.baseRotation;

	// 🔍 ОТЛАДКА: выводим все ключевые значения
	const fireRate = config.fireRate;
	const timeSinceLastShot = state.time - (state.lastFireTime ?? 0);
	const canFire = state.isFiring && timeSinceLastShot >= fireRate;

		// 🔥 Импульс отдачи при выстреле
		if (canFire) {
			Weapon.debugDirection(weaponGroup);  // или this.debugDirection(weaponGroup)
			anim.recoilZ = config.fireKick;            // откат назад
			anim.rotX = config.recoilAmount;           // подброс вверх
			anim.rotZ = (Math.random() - 0.5) * 0.03;  // случайный наклон

			state.lastFireTime = state.time;
		}

		// 🔄 Плавное восстановление (LERP к нулю)
		const recover = Math.min(1, dt * config.recoverySpeed);
		anim.recoilZ += (0 - anim.recoilZ) * recover;
		anim.rotX    += (0 - anim.rotX) * recover;
		anim.rotZ    += (0 - anim.rotZ) * recover;

			// Применяем к 3D-объекту
			weaponGroup.position.z = (basePos ? basePos.z : 0) + anim.recoilZ;
			weaponGroup.rotation.x = (baseRot ? baseRot.x : 0) + anim.rotX;
			weaponGroup.rotation.z = (baseRot ? baseRot.z : 0) + anim.rotZ;
		} 

	/**
	 * Наклон оружия при перезарядке (плавная дуга)
	 */
	static applyReload(weaponGroup, state, config) {
		const baseRot = weaponGroup.userData?.baseRotation;
		const p = state.reloadProgress; // 0 → 1
		const arc = Math.sin(p * Math.PI); // плавная дуга: 0 → 1 → 0

		weaponGroup.rotation.x = (baseRot ? baseRot.x : 0) - config.reloadTilt * arc;
		weaponGroup.rotation.z += 0.2 * arc;
	}
	//----------------------------------------------and-updata----------------------------------------------------------
	// === МЕТОДЫ СТРЕЛЬБЫ ===

	// Основной метод стрельбы (переопределяется в наследниках)
	// Вызывается, когда игрок нажимает кнопку атаки для данного оружия
	// Параметры:
	//   game   - ссылка на основной игровой объект (GameEngine), содержит списки врагов, снарядов и т.д.
	//   camera - камера Three.js, используется для определения направления выстрела
	//   scene  - сцена Three.js, нужна для добавления/удаления визуальных эффектов (снарядов, света)
	//   audio  - система звуков (AudioSystem), воспроизводит звук выстрела
	//   props  - объект со вспомогательными методами (spawnParticles, spawnTracer и т.д.)
	// Возвращает true, если выстрел произведён, false — если нельзя стрелять (нет патронов, идёт перезарядка)
	fire(game, camera, scene, audio, props) {
		// Проверяем, можно ли стрелять: есть ли патроны и не идёт ли перезарядка
		if (!this.canFire()) return false;

		// Воспроизводим звук выстрела, соответствующий этому оружию (например, "pulse_rifle" или "rocket_launch")
		audio.play(this.sound);

		// Находим HTML-элемент с id="muzzle-flash" (это может быть div или спрайт для 2D-вспышки)
		const mf = document.getElementById('muzzle-flash');
		if (mf) {
			// Делаем вспышку видимой (opacity = 1)
			mf.style.opacity = 1;
			// Через 50 миллисекунд скрываем её (возвращаем прозрачность в 0)
			setTimeout(() => (mf.style.opacity = 0), 50);
		}

		// Определяем тип оружия и вызываем соответствующую логику стрельбы
		if (this.type === 'ray' || this.type === 'ray_multi') {
			// Hitscan-оружие (лучевое): мгновенное попадание по линии взгляда
			// Поддерживает несколько "снарядов" за раз (дробь)
			const pellets = this.pellets || 1;  // количество фрагментов (для дробовика > 1)
			for (let i = 0; i < pellets; i++) {
				// Каждый "лучик" производит рейкаст и наносит урон первому врагу на пути
				// Параметры: game, камера, props, урон, разброс, цвет трассера
				this.raycastShot(game, camera, props, this.damage, this.spread, this.tracerColor);
			}
		} else if (this.type === 'projectile') {
			// Оружие с физическим снарядом (ракета, граната и т.п.)
			// Создаёт объект, который движется по сцене и взрывается при столкновении
			this.fireProjectile(game, camera, scene);
		}

		// Уменьшаем количество патронов на 1 (или больше, если оружие потребляет несколько за раз)
		this.consumeAmmo();
		// Сообщаем, что выстрел успешно выполнен
		return true;
	}

	// Raycast выстрел (для hitscan оружия который наносят урон мгновенно пули нет )
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
