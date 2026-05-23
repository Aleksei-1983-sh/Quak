const WEAPONS = [
  {
	name: 'PULSE RIFLE', type: 'ray', damage: 12, fireRate: 0.15,
	ammo: 200, maxAmmo: 200, spread: 0.02, sound: 'pulse_rifle',
	color: 0x00ff44, auto: true
  },
  {
	name: 'SHOTGUN', type: 'ray_multi', damage: 8, fireRate: 0.8,
	ammo: 20, maxAmmo: 20, pellets: 8, spread: 0.08, sound: 'shotgun',
	color: 0xff8800, auto: false
  },
  {
	name: 'ROCKET LAUNCHER', type: 'projectile', damage: 100, fireRate: 0.7,
	ammo: 10, maxAmmo: 10, spread: 0.01, sound: 'rocket',
	color: 0xff4400, auto: false
  }
];

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
	this.weapons = JSON.parse(JSON.stringify(WEAPONS));
	this.onGround = true;
	this.sprinting = false;
	this.godMode = true; // <--- ДОБАВИТЬ ЭТУ СТРОКУ
  }

  update(dt) {
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
		const newX = this.position.clone().add(new THREE.Vector3(moveDir.x, 0, 0));
		if (!this.game.collision.checkCollision(newX)) this.position.x = newX.x;
		const newZ = this.position.clone().add(new THREE.Vector3(0, 0, moveDir.z));
		if (!this.game.collision.checkCollision(newZ)) this.position.z = newZ.z;
	  }
	}

	// Bounds
	// Динамические границы на основе размера карты
	const level = this.game.level;
	if (level) {
	  const margin = 1; // Отступ от края в метрах
	  const mapHalfWidth = (level.cols * level.tileSize) / 2;
	  const mapHalfDepth = (level.rows * level.tileSize) / 2;
	  
	  this.position.x = Math.max(-mapHalfWidth + margin, Math.min(mapHalfWidth - margin, this.position.x));
	  this.position.z = Math.max(-mapHalfDepth + margin, Math.min(mapHalfDepth - margin, this.position.z));
	}
	this.position.y = 1.7;

	// Update camera
	this.game.camera.position.copy(this.position);
	this.game.camera.rotation.order = 'YXZ';
	this.game.camera.rotation.y = this.yaw;
	this.game.camera.rotation.x = this.pitch;
  }

  takeDamage(damage) {
	if (this.godMode) return; // <--- ДОБАВИТЬ ЭТУ СТРОКУ (Игра не примет урон)

	if (this.armor > 0) {
	  const armorAbsorb = Math.min(this.armor, damage * 0.6);
	  this.armor -= armorAbsorb;
	  damage -= armorAbsorb;
	}

	this.health -= damage;
	this.health = Math.max(0, this.health);
	this.game.audio.play('pain');

	const df = document.getElementById('damage-flash');
	df.style.opacity = 0.6;
	setTimeout(() => df.style.opacity = 0, 200);

	this.game.hud.update();

	if (this.health <= 0) {
	  this.game.gameOver();
	}
  }
}
