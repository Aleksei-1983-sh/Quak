// weapons/RocketLauncher.js
import { Weapon } from './Weapon.js';
import { Rocket } from '../projectiles/index.js';
import { loadWeaponGLB } from '../../utils/WeaponGLBLoader.js';

/**
 * 🚀 РАКЕТНИЦА — тяжёлое проектайл-оружие
 * 
 * Особенности:
 * • Загружает геометрию из GLB (Blender)
 * • Анимации (отдача, вспышка) — через базовый класс Weapon
 * • Стреляет управляемыми ракетами с взрывом по площади
 */
export class RocketLauncher extends Weapon {

	constructor() {
		super({
			// === ИДЕНТИФИКАЦИЯ ===
			name: 'ROCKET LAUNCHER',
			icon: '🚀',
			type: 'projectile',      // обязательно для fireProjectile()

			// === БАЛАНС ===
			damage: 120,             // урон одной ракеты
			fireRate: 0.8,           // секунд между выстрелами
			ammo: 5,                 // стартовый боезапас
			maxAmmo: 5,              // макс. боезапас
			reloadTime: 2.8,         // время перезарядки (сек)
			spread: 0.008,           // разброс (очень маленький — ракетница точная)
			auto: false,             // полуавтоматический режим

			// === ЗВУК И ЭФФЕКТЫ ===
			sound: 'rocket_launch',  // имя звука в аудиосистеме
			muzzleFlashColor: 0xff8800,  // цвет вспышки выстрела
			tracerColor: 0xff6600,       // цвет трассера (если нужен)

			// === АНИМАЦИЯ (переопределяем пресет для тяжёлого оружия) ===
			// См. шпаргалку в Weapon.js за подробностями
			recoilAmount: 0.25,          // сильный подброс ствола
			fireKick: 0.3,               // мощный откат назад
			recoverySpeed: 4,            // медленное восстановление (ощущение веса)
			swayIdleX: 0.005, swayIdleY: 0.003,   // минимальное покачивание — оружие тяжёлое
			swayMoveX: 0.01,  swayMoveY: 0.007,
			swaySpeed: 5,                // медленные колебания
			sprintSwayMultiplier: 1.2,   // меньше реагирует на бег
			reloadTilt: 0.5,             // выразительный наклон при перезарядке

			// === МОДЕЛЬ ===
			modelConfig: {
				// Относительно корня проекта (где index.html)
				glbUrl: './assets/models/weapons/rocket_launcher.glb',  // ← путь к GLB-файлу
			}
		});

		// Ссылки на части модели (заполняются после загрузки)
		this.weaponParts = null;
	}

	/**
	 * 📦 Асинхронная загрузка модели из GLB
	 * Вызывать при инициализации игры, до первого использования оружия
	 * @param {THREE} THREE - инстанс Three.js
	 * @returns {Promise<THREE.Group>} корневой объект модели
	 */
	async loadModel(THREE) {
		const { glbUrl } = this.modelConfig;

		try {
			const loaded = await loadWeaponGLB(glbUrl, THREE);
			this.weaponParts = loaded;

			// Настройка теней для всех мешей
			loaded.model?.traverse?.((child) => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});

			return loaded.model;
		} catch (err) {
			console.error('❌ Не удалось загрузить модель ракетницы:', err);
			const fallback = this.createModel(THREE);
			return fallback.weaponGroup;
		}
	}

	/**
	 * 💥 Радиус взрыва ракеты (переопределение)
	 * @returns {number} радиус в единицах сцены
	 */
	getExplosionRadius() {
		return 6.5;
	}

	/**
	 * 🚀 Выстрел ракетой (переопределение базового fireProjectile)
	 * Создаёт управляемый снаряд с трассером и светом
	 * 
	 * @param {GameEngine} game - игровой движок
	 * @param {THREE.Camera} camera - камера игрока
	 * @param {THREE.Scene} scene - сцена Three.js
	 */
	fireProjectile(game, camera, scene) {
		// 1. Расчёт направления с учётом разброса
		const dir = new THREE.Vector3(
			(Math.random() - 0.5) * this.spread,
			(Math.random() - 0.5) * this.spread,
			-1
		).normalize().applyQuaternion(camera.quaternion);

		// 2. Точка спавна: чуть впереди дула (если есть ссылка на muzzle)
		let spawnPos = camera.position.clone().add(dir.clone().multiplyScalar(1.0));
		if (this.weaponParts?.muzzle) {
			this.weaponParts.muzzle.getWorldPosition(spawnPos);
			spawnPos.add(dir.clone().multiplyScalar(0.5));
		}

		// 3. Создаём ракету через класс Rocket
		const rocket = new Rocket(
			spawnPos,                    // стартовая позиция
			dir,                         // направление полёта
			this.damage,                 // урон
			this.getExplosionRadius(),   // радиус взрыва
			this.muzzleFlashColor,       // цвет эффектов
			this                         // ссылка на оружие (для логики)
		);

		// 4. Добавляем в сцену и в список активных снарядов
		scene.add(rocket.mesh);
		if (rocket.light) scene.add(rocket.light);
		game.projectiles.push(rocket);

		// 5. Расходуем патрон (базовый класс)
		this.consumeAmmo();
	}

	/**
	 * 🔥 Дополнительная визуализация вспышки (опционально)
	 * Базовый класс уже управляет gunLight, но можно добавить частицы
	 * @param {THREE.Scene} scene 
	 */
	triggerExtraFlash(scene) {
		if (!this.weaponParts?.muzzle || !scene) return;

		// Пример: создаём кратковременную сферу-вспышку
		const flashGeo = new THREE.SphereGeometry(0.12, 6, 6);
		const flashMat = new THREE.MeshBasicMaterial({ 
			color: this.muzzleFlashColor, 
			transparent: true, 
			opacity: 0.9 
		});
		const flash = new THREE.Mesh(flashGeo, flashMat);

		this.weaponParts.muzzle.getWorldPosition(flash.position);
		scene.add(flash);

		// Исчезает через 80мс
		setTimeout(() => {
			scene.remove(flash);
			flashGeo.dispose();
			flashMat.dispose();
		}, 80);
	}
}
