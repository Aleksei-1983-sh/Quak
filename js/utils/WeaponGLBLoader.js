// utils/WeaponGLBLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Загружает оружие из GLB и возвращает удобные ссылки на части
 * @param {string} url - путь к .glb файлу
 * @param {THREE} THREE - инстанс Three.js
 * @returns {Promise<Object>} { root, parts, lights, model }
 */
export async function loadWeaponGLB(url, THREE) {
	return new Promise((resolve, reject) => {
		const loader = new GLTFLoader();

		loader.load(
			url,
			(gltf) => {
				const model = gltf.scene;

				// Словарь частей по имени
				const parts = {};
				const lights = {};

				model.traverse((child) => {
					if (child.isMesh) {
						// Сохраняем по имени из Blender
						if (child.name) {
							parts[child.name] = child;
						}
						// Включаем тени
						child.castShadow = true;
						child.receiveShadow = true;
					}
					if (child.isLight) {
						if (child.name) {
							lights[child.name] = child;
						}
						// Свет по умолчанию выключен
						if (child.intensity !== undefined) {
							child.intensity = 0;
						}
					}
				});

				resolve({
					root: model,           // корневой объект
					model: model,          // alias для совместимости
					parts,                 // { Barrel: Mesh, Muzzle: Mesh, ... }
					lights,                // { MuzzleLight: PointLight, ... }
					// Удобные алиасы для частых частей
					barrel: parts['Barrel'] || parts['barrel'] || null,
					muzzle: parts['Muzzle'] || parts['muzzle'] || null,
					body: parts['Body'] || parts['body'] || null,
					grip: parts['Grip'] || parts['grip'] || null,
					muzzleLight: lights['MuzzleLight'] || lights['muzzleLight'] || null,
				});
			},
			undefined,
			(error) => {
				console.error(`❌ Ошибка загрузки ${url}:`, error);
				reject(error);
			}
		);
	});
}
