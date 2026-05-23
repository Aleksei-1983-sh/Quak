// Подключаем классы оружия из отдельных файлов
// Классы должны быть загружены через HTML перед этим файлом

class Player {
  constructor(game) {
	this.game = game;
	this.position = new THREE.Vector3(2, 1.7, 2);
	this.yaw = 0;
	this.pitch = 0;
	this.health = 100;
	this.maxHealth = 100;
	this.armor = 0;
	this.maxArmor = 100;
	
	// Создаем массив оружия используя новые классы
	this.weapons = [
	  new Rifle(),
	  new Pistol(),
	  new Shotgun(),
	  new RocketLauncher()
	];
	
	this.onGround = true;
	this.sprinting = false;
	this.godMode = false;
  }

  update(dt) {
	DEBUG.entity.trace('Player update start', { dt, pos: this.position });
	
	const input = this.game.input;
	const speed = (input.isPressed('ShiftLeft') ? 6 : 3.5) * dt;
	this.sprinting = input.isPressed('ShiftLeft');

	// Mouse look
	if (input.pointerLocked) {
	  this.yaw -= input.mouse.dx * 0.002;
	  this.pitch -= input.mouse.dy * 0.002;
	  this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
	  input.mouse.dx = 0;
	  input.mouse.dy = 0;
	}

	// Movement
	const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
	const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
	const moveDir = new THREE.Vector3();

	if (input.isPressed('KeyW')) moveDir.add(forward);
	if (input.isPressed('KeyS')) moveDir.sub(forward);
	if (input.isPressed('KeyA')) moveDir.sub(right);
	if (input.isPressed('KeyD')) moveDir.add(right);

	if (moveDir.length() > 0) {
	  moveDir.normalize().multiplyScalar(speed);
	  const newPos = this.position.clone().add(moveDir);

	  if (!this.game.collision.checkCollision(newPos)) {
		this.position.add(moveDir);
	  } else {
		DEBUG.physics.trace('Коллизия игрока, пытаемся разделить движение');
		const newX = this.position.clone().add(new THREE.Vector3(moveDir.x, 0, 0));
		if (!this.game.collision.checkCollision(newX)) {
		  this.position.x = newX.x;
		  DEBUG.physics.trace('Движение по X успешно');
		}
		const newZ = this.position.clone().add(new THREE.Vector3(0, 0, moveDir.z));
		if (!this.game.collision.checkCollision(newZ)) {
		  this.position.z = newZ.z;
		  DEBUG.physics.trace('Движение по Z успешно');
		}
	  }
	}

	// Bounds
	// Динамические границы на основе размера карты
	const level = this.game.level;
	if (level) {
	  const margin = 1; // Отступ от края в метрах
	  const mapHalfWidth = (level.cols * level.tileSize) / 2;
	  const mapHalfDepth = (level.rows * level.tileSize) / 2;
	  
	  const oldX = this.position.x;
	  const oldZ = this.position.z;
	  this.position.x = Math.max(-mapHalfWidth + margin, Math.min(mapHalfWidth - margin, this.position.x));
	  this.position.z = Math.max(-mapHalfDepth + margin, Math.min(mapHalfDepth - margin, this.position.z));
	  
	  // Логирование если позиция была обрезана границами
	  if (oldX !== this.position.x || oldZ !== this.position.z) {
		DEBUG.world.warn('Игрок уперся в границу карты', { pos: this.position });
	  }
	}
	this.position.y = 1.7;

	// Update camera
	this.game.camera.position.copy(this.position);
	this.game.camera.rotation.order = 'YXZ';
	this.game.camera.rotation.y = this.yaw;
	this.game.camera.rotation.x = this.pitch;
	
	DEBUG.entity.trace('Player update end', { pos: this.position, yaw: this.yaw, pitch: this.pitch });
  }

  takeDamage(damage) {
	DEBUG.entity.info('Игрок получает урон', { damage, godMode: this.godMode });
	
	if (this.godMode) {
	  DEBUG.entity.log('God Mode активен - урон игнорируется');
	  return;
	}

	if (this.armor > 0) {
	  const armorAbsorb = Math.min(this.armor, damage * 0.6);
	  this.armor -= armorAbsorb;
	  damage -= armorAbsorb;
	  DEBUG.entity.log(`Броня поглотила ${armorAbsorb.toFixed(1)} урона`);
	}

	this.health -= damage;
	this.health = Math.max(0, this.health);
	DEBUG.entity.warn(`Здоровье игрока: ${this.health.toFixed(1)}`);
	this.game.audio.play('pain');

	const df = document.getElementById('damage-flash');
	df.style.opacity = 0.6;
	setTimeout(() => df.style.opacity = 0, 200);

	this.game.hud.update();

	if (this.health <= 0) {
	  DEBUG.entity.error('Игрок погиб!');
	  this.game.gameOver();
	}
  }
}
