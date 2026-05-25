class GameEngine {
	constructor() {
		DEBUG.core.info('=== Инициализация GameEngine ===');
		this.audio = new AudioSystem();
		DEBUG.core.log('AudioSystem создан');
		this.input = new InputManager();
		DEBUG.core.log('InputManager создан');
		this.running = false;
		this.deltaTime = 0;
		this.fps = 0;
		this.frameCount = 0;
		this.fpsTime = 0;

		this.score = 0;
		this.currentWeapon = 0;
		this.fireTimer = 0;
		this.weaponBob = 0;
		this.reloading = false;
		this.reloadTimer = 0;
		this.enemiesKilled = 0;
		this.totalEnemies = 0;
		this.levelComplete = false;
		this._wasFiring = false;

		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.clock = new THREE.Clock();
		this.weaponGroup = null;
		this.weaponMesh = null;
		this.gunLight = null;

		this.player = null;
		this.enemies = [];
		this.projectiles = [];
		this.pickups = [];
		this.particles = [];
		this.walls = [];

		this.renderer3d = null;
		this.level = null;
		this.collision = null;
		this.props = null;
		this.hud = null;
		this.postFX = null;

		DEBUG.core.info('GameEngine создан, вызываем init()');
		this.init();
	}

	async init() {
		DEBUG.core.info('=== Запуск init() ===');
		this.renderer3d = new Renderer();
		DEBUG.render.log('Renderer создан');
		this.scene = this.renderer3d.scene;
		this.camera = this.renderer3d.camera;
		this.renderer = this.renderer3d.renderer;

		this.collision = new Collision();
		DEBUG.world.log('Collision создан');
		this.walls = this.collision.walls;

		this.postFX = new PostProcessing();
		DEBUG.render.log('PostProcessing создан');
		this.hud = new HUD(this);
		DEBUG.ui.log('HUD создан');
		this.props = new Props(this);
		DEBUG.world.log('Props создан');

		//в нутри игрока создается массив с оружеем
		this.player = new Player(this);
		DEBUG.entity.info('Player создан', { pos: this.player.position });
		await this.setupWeaponModel();
		DEBUG.render.log('Оружие создано');
		this.level = new Level(this);
		DEBUG.world.info('Level создан', { rows: this.level.rows, cols: this.level.cols });
		this.spawnEnemies();
		DEBUG.entity.info(`Враги заспавлены: ${this.totalEnemies}`);
		this.spawnPickups();
		DEBUG.world.log(`Pickups заспавлены: ${this.pickups.length}`);

		window.addEventListener('resize', () => this.onResize());
		document.addEventListener('keydown', e => this.onKeyDown(e));
		DEBUG.input.log('Слушатели событий добавлены');

		this.audio.play('ambient');
		DEBUG.audio.log('Ambient звук запущен');
		DEBUG.core.info('=== init() завершен ===');
	}

	/**
	 * 🎮 Загружает и настраивает модель оружия для вида от первого лица
	 * Вызывать при смене оружия или инициализации игрока
	 * @async
	 */
	async setupWeaponModel() {
		const weapon = this.player.weapons[this.currentWeapon];
		
		// 🔹 1. Удаляем старую модель (если есть)
		if (this.weaponGroup && this.weaponGroup.parent) {
			this.weaponGroup.parent.remove(this.weaponGroup);
			
			// Очистка памяти: удаляем геометрию и материалы
			this.weaponGroup.traverse?.((child) => {
				if (child.isMesh) {
					child.geometry?.dispose();
					if (Array.isArray(child.material)) {
						child.material.forEach(m => m.dispose());
					} else {
						child.material?.dispose();
					}
				}
			});
		}

		// 🔹 3. Проверяем, поддерживает ли оружие загрузку из GLB
		if (weapon?.loadModel && typeof weapon.loadModel === 'function') {
			try {
				// 📦 Загружаем модель асинхронно
				const model = await weapon.loadModel(THREE);
				
				// 🎯 Настраиваем позицию для вида от первого лица
				// Поза оружия относительно камеры
				model.position.set(0.0000, -0.0000, 0.0000);
				model.rotation.set(0.0000, -0.0000, -0.0000);
				model.scale.setScalar(1.0000);

				model.userData.basePosition = model.position.clone();
				model.userData.baseRotation = model.rotation.clone();
				model.userData.baseScale = model.scale.clone();
				
				// 🔦 Сохраняем ссылки на части для анимаций (если есть)
				this.weaponMesh = model;                 // основная ссылка
				this.gunLight = weapon.weaponParts?.muzzleLight || null;

				this.weaponGroup = model;
				this.camera.add(this.weaponGroup);
				
				console.log(`✅ Модель "${weapon.name}" загружена`);
				
			} catch (err) {
				console.error(`❌ Ошибка загрузки модели "${weapon.name}":`, err);
				
				// Fallback: оставляем плейсхолдер или создаём простую модель
				box.material.color.set(0xff0000); // красный = ошибка
				// Или создаём заглушку через базовый createModel():
				// const fallback = weapon.createModel?.(THREE);
				// if (fallback) { /* ...настройка... */ }
			}
		} 
		else {
			console.warn(`⚠️ Оружие "${weapon?.name}" не имеет модели`);
			this.camera.remove(placeholder);
		}
		
		// 🔹 5. Добавляем камеру в сцену (если ещё не добавлена)
		if (!this.camera.parent) {
			this.scene.add(this.camera);
		}
	}

	spawnEnemies() {
		const positions = [
			{ x: -15, z: -15, type: 'soldier' },
			{ x: 15, z: -15, type: 'soldier' },
			{ x: -15, z: 15, type: 'grunt' },
			{ x: 15, z: 15, type: 'grunt' },
			{ x: -5, z: -12, type: 'grunt' },
			{ x: 5, z: 12, type: 'grunt' },
			{ x: -20, z: 0, type: 'soldier' },
			{ x: 20, z: 0, type: 'soldier' },
			{ x: 0, z: -20, type: 'boss' },
			{ x: -10, z: 5, type: 'grunt' },
			{ x: 10, z: -5, type: 'grunt' },
			{ x: -22, z: -22, type: 'soldier' },
			{ x: 22, z: 22, type: 'soldier' },
			{ x: 0, z: 20, type: 'boss' }
		];

		positions.forEach(p => {
			const enemy = new Enemy(p.x, p.z, p.type, this);
			this.enemies.push(enemy);
			this.totalEnemies++;
		});
	}

	spawnPickups() {
		const pickupPositions = [
			{ x: -10, z: 0, type: 'health' },
			{ x: 10, z: 0, type: 'health' },
			{ x: 0, z: -10, type: 'armor' },
			{ x: 0, z: 10, type: 'armor' },
			{ x: -20, z: 10, type: 'ammo' },
			{ x: 20, z: -10, type: 'ammo' },
			{ x: -18, z: -18, type: 'health' },
			{ x: 18, z: 18, type: 'ammo' },
			{ x: 5, z: 5, type: 'health' },
			{ x: -5, z: -5, type: 'ammo' }
		];

		const colors = { health: 0x00ff44, armor: 0x4488ff, ammo: 0xffaa00 };

		pickupPositions.forEach(p => {
			const geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
			const mat = new THREE.MeshBasicMaterial({ color: colors[p.type] });
			const mesh = new THREE.Mesh(geo, mat);
			mesh.position.set(p.x, 0.5, p.z);

			const glowGeo = new THREE.SphereGeometry(0.5, 8, 8);
			const glowMat = new THREE.MeshBasicMaterial({
				color: colors[p.type], transparent: true, opacity: 0.2
			});
			const glow = new THREE.Mesh(glowGeo, glowMat);
			mesh.add(glow);

			this.scene.add(mesh);

			this.pickups.push({
				position: new THREE.Vector3(p.x, 0.5, p.z),
				type: p.type,
				mesh: mesh,
				active: true
			});
		});
	}

	onKeyDown(e) {
		if (e.code === 'Digit1') this.switchWeapon(0);
		if (e.code === 'Digit2') this.switchWeapon(1);
		if (e.code === 'Digit3') this.switchWeapon(2);
		if (e.code === 'Digit4') this.switchWeapon(3);
		if (e.code === 'KeyR') this.reload();

		if (e.code === 'KeyG') { // <--- ДОБАВИТЬ ЭТОТ БЛОК
			this.player.godMode = !this.player.godMode;
			console.log(`Год Mode: ${this.player.godMode}`);
		}
	}

	async switchWeapon(idx) {
		if (idx === this.currentWeapon || idx >= this.player.weapons.length) return;
		this.currentWeapon = idx;
		this.reloading = false;

		// Пересоздаем модель оружия при переключении
		if (this.weaponGroup) {
			this.camera.remove(this.weaponGroup);
		}
		await this.setupWeaponModel();

		this.hud.update();

		const wn = document.getElementById('weapon-name');
		wn.textContent = this.player.weapons[idx].name;
		wn.style.opacity = 1;
		setTimeout(() => wn.style.opacity = 0, 1500);
	}

	reload() {
		const w = this.player.weapons[this.currentWeapon];
		if (!w.canReload() || this.reloading) return;
		this.reloading = true;
		this.reloadTimer = w.reloadTime || 1.5;
	}

	update(dt) {
		if (!this.running) return;

		DEBUG.core.trace('update() start', { dt, fps: this.fps });

		this.frameCount++;
		this.fpsTime += dt;
		if (this.fpsTime >= 1) {
			this.fps = this.frameCount;
			this.frameCount = 0;
			this.fpsTime = 0;
			document.getElementById('fps').textContent = `${this.fps} FPS`;
			DEBUG.perf.log(`FPS: ${this.fps}`);
		}

		this.player.update(dt);
		this.updateShooting(dt);

		if (this.reloading) {
			this.reloadTimer -= dt;
			if (this.reloadTimer <= 0) {
				const w = this.player.weapons[this.currentWeapon];
				w.reload();
				this.reloading = false;
				DEBUG.combat.info('Перезарядка завершена');
				this.hud.update();
			}
		}

		this.enemies.forEach(e => e.update(dt));
		this.updateProjectiles(dt);
		this.props.updateParticles(dt);
		this.updatePickups(dt);

		const moving = this.input.isPressed('KeyW') || this.input.isPressed('KeyS') ||
			this.input.isPressed('KeyA') || this.input.isPressed('KeyD');
		if (moving && this.player.onGround) {
			this.weaponBob += dt * (this.player.sprinting ? 12 : 8);
		} else {
			this.weaponBob *= 0.9;
		}

		// Обновление анимации текущего оружея оружия через метод самого оружия
		const weapon = this.player.weapons[this.currentWeapon];
		if (this.weaponGroup && weapon) {
			const movingNow = this.input.isPressed('KeyW') || this.input.isPressed('KeyS') || this.input.isPressed('KeyA') || this.input.isPressed('KeyD');
			const reloadDuration = weapon.reloadTime || 1.5;
			const reloadProgress = this.reloading ? 1 - Math.max(0, this.reloadTimer) / reloadDuration : 0;

			// Анимация через метод оружия
			if (weapon.update) {
				weapon.setState({
					isFiring: this.fireTimer > 0,
					isReloading: this.reloading,
					isMoving: movingNow && this.player.onGround,
					isSprinting: !!this.player.sprinting,
					reloadProgress
				});
				weapon.update(dt, this.weaponGroup);
			}
		}

		if (this.enemiesKilled >= this.totalEnemies && !this.levelComplete) {
			this.levelComplete = true;
			const msg = document.getElementById('level-msg');
			msg.textContent = 'SECTOR CLEARED';
			msg.style.opacity = 1;
			DEBUG.ui.info('Уровень завершен!');
			setTimeout(() => msg.style.opacity = 0, 3000);
		}

		// Обновление отладочной панели
		if (this.input.isPressed('F2') && this.level) {
			const p = this.player;
			const debug = document.getElementById('debug-content');
			debug.innerHTML = `
		POS: ${p.position.x.toFixed(1)}, ${p.position.z.toFixed(1)}<br>
		MAP: ${this.level.rows}x${this.level.cols} tiles<br>
		WALLS: ${this.walls.length}<br>
		ENEMIES: ${this.enemies.length}/${this.totalEnemies}<br>
		FPS: ${this.fps}
	  `;
		}

		DEBUG.core.trace('update() end');
	}

	updateShooting(dt) {
		//получаем текущее оружее которое сейчас в руках 
		const w = this.player.weapons[this.currentWeapon];

		// Проверка валидности оружия
		if (!DEBUG.validate(w, 'currentWeapon', 'COMBAT')) return;

		if (this.fireTimer > 0) { 
			this.fireTimer -= dt; 
			return; 
		}

		if (this.input.mouse.left && w.canFire() && !this.reloading) {
			if (w.auto || !this._wasFiring) {
				DEBUG.combat.trace('Выстрел', { weapon: w.name, ammo: w.ammo });
				// Используем новый метод fire() из класса оружия
				w.fire(this, this.camera, this.scene, this.audio, this.props, this.hud);
				this.fireTimer = w.fireRate;
				this.hud.update();
			}
		}
		this._wasFiring = this.input.mouse.left;
	}

	updateProjectiles(dt) {
		DEBUG.physics.trace('updateProjectiles start', { count: this.projectiles.length });

		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			const proj = this.projectiles[i];

			// Проверка валидности снаряда
			if (!DEBUG.validate(proj, `projectile[${i}]`, 'PHYSICS')) {
				this.projectiles.splice(i, 1);
				continue;
			}

			// --- НОВОЕ: если снаряд имеет собственный метод update (ракета) ---
			if (proj.update && typeof proj.update === 'function') {
				// Вызываем кастомное обновление. Если оно вернёт false – снаряд нужно удалить.
				const keep = proj.update(dt, this.scene, this);
				if (!keep) {
					// Удаляем модели и свет (если они есть)
					if (proj.mesh) this.scene.remove(proj.mesh);
					if (proj.light) this.scene.remove(proj.light);
					this.projectiles.splice(i, 1);
				}
				continue; // переходим к следующему снаряду
			}

			// --- СТАРАЯ ЛОГИКА ДЛЯ ОБЫЧНЫХ СНАРЯДОВ (дробь, плазма и т.п.) ---
			proj.life -= dt;
			if (proj.life <= 0) { 
				DEBUG.physics.trace('Снаряд уничтожен по времени жизни');
				this.explodeProjectile(proj); 
				continue; 
			}

			proj.position.add(proj.velocity.clone().multiplyScalar(dt));
			proj.mesh.position.copy(proj.position);

			if (this.collision.checkCollision(proj.position, 0.3)) {
				DEBUG.physics.info('Снаряд попал в стену');
				this.explodeProjectile(proj);
				continue;
			}

			let hit = false;
			this.enemies.forEach(enemy => {
				if (enemy.state === 'dead' || hit) return;
				if (proj.position.distanceTo(enemy.position) < enemy.size + 0.3) {
					DEBUG.combat.info('Снаряд попал во врага', { enemy: enemy.type });
					this.explodeProjectile(proj);
					enemy.takeDamage(proj.damage);
					hit = true;
				}
			});
		}

		// Фильтрация уже не нужна, т.к. удаление происходит в цикле,
		// но оставляем для совместимости (старые снаряды, у которых life <=0, уже удалены через explodeProjectile)
		this.projectiles = this.projectiles.filter(p => p.life > 0);
		DEBUG.physics.trace('updateProjectiles end', { remaining: this.projectiles.length });
	}
	explodeProjectile(proj) {
		DEBUG.physics.info('Взрыв снаряда', { pos: proj.position, damage: proj.damage });

		this.audio.play('explosion');
		this.props.spawnParticles(proj.position.clone(), 0xff4400, 30);

		let enemiesHit = 0;
		this.enemies.forEach(enemy => {
			if (enemy.state === 'dead') return;
			const dist = proj.position.distanceTo(enemy.position);
			if (dist < 5) {
				const dmg = proj.damage * (1 - dist / 5);
				enemy.takeDamage(dmg);
				enemiesHit++;
				DEBUG.combat.log(`Враг ${enemy.type} получил ${dmg.toFixed(1)} урона от взрыва`);
			}
		});
		DEBUG.combat.info(`Взрыв задел врагов: ${enemiesHit}`);

		const playerDist = proj.position.distanceTo(this.player.position);
		if (playerDist < 4) {
			const playerDmg = Math.floor(proj.damage * (1 - playerDist / 4));
			DEBUG.combat.warn(`Игрок получил урон от взрыва: ${playerDmg}`);
			this.player.takeDamage(playerDmg);
		}

		if (proj.mesh) {
			this.scene.remove(proj.mesh);
			if (proj.mesh.children[0]) this.scene.remove(proj.mesh.children[0]);
		}
		DEBUG.physics.trace('Взрыв завершен');
	}

	updatePickups(dt) {
		DEBUG.world.trace('updatePickups', { count: this.pickups.length });

		this.pickups.forEach(pickup => {
			if (!pickup.active) return;

			pickup.mesh.rotation.y += dt * 2;
			pickup.mesh.rotation.x += dt;
			pickup.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.15;

			const dist = this.player.position.distanceTo(pickup.position);
			if (dist < 1.5) {
				DEBUG.world.info(`Подбор предмета: ${pickup.type}`);
				switch (pickup.type) {
					case 'health':
						this.player.health = Math.min(this.player.maxHealth, this.player.health + 25);
						DEBUG.entity.log(`Здоровье восстановлено: ${this.player.health}`);
						break;
					case 'armor':
						this.player.armor = Math.min(this.player.maxArmor, this.player.armor + 30);
						DEBUG.entity.log(`Броня восстановлена: ${this.player.armor}`);
						break;
					case 'ammo':
						this.player.weapons.forEach(w => w.ammo = Math.min(w.maxAmmo, w.ammo + 25));
						DEBUG.combat.log('Патроны подобраны');
						break;
				}
				pickup.active = false;
				pickup.mesh.visible = false;
				this.audio.play('pickup');
				this.hud.update();
			}
		});
	}

	showHitMarker() {
		const marker = document.createElement('div');
		marker.className = 'hit-marker';
		marker.innerHTML = '✕';
		document.body.appendChild(marker);
		setTimeout(() => marker.remove(), 300);
	}

	gameOver() {
		this.running = false;
		document.exitPointerLock();

		const overlay = document.getElementById('overlay');
		overlay.classList.remove('hidden');
		overlay.querySelector('h1').textContent = 'YOU DIED';
		overlay.querySelector('.subtitle').textContent = `SCORE: ${this.score} | KILLS: ${this.enemiesKilled}`;
		overlay.querySelector('.start-btn').textContent = 'RESPAWN';
		overlay.querySelector('.start-btn').onclick = () => location.reload();
	}

	render() {
		this.renderer.render(this.scene, this.camera);
		this.hud.updateMinimap();
	}

	start() {
		this.audio.init();
		this.running = true;
		this.input.lock(this.renderer.domElement);
		document.getElementById('overlay').classList.add('hidden');
		this.hud.update();

		const loop = () => {
			if (!this.running) return;
			this.deltaTime = Math.min(this.clock.getDelta(), 0.05);
			this.update(this.deltaTime);
			this.render();
			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);
	}

	onResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
