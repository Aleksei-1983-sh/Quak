// Базовый класс для всех видов оружия
class BaseWeapon {
  constructor(config) {
    this.name = config.name || 'WEAPON';
    this.type = config.type || 'ray'; // ray, ray_multi, projectile
    this.damage = config.damage || 10;
    this.fireRate = config.fireRate || 0.5;
    this.ammo = config.ammo || 30;
    this.maxAmmo = config.maxAmmo || 30;
    this.spread = config.spread || 0.02;
    this.sound = config.sound || 'pulse_rifle';
    this.color = config.color || 0x00ff44;
    this.auto = config.auto || false;
    this.icon = config.icon || '🔫';
    this.pellets = config.pellets || 1;
  }

  // Метод для получения текущей информации об оружии
  getInfo() {
    return {
      name: this.name,
      ammo: this.ammo,
      maxAmmo: this.maxAmmo,
      damage: this.damage,
      fireRate: this.fireRate
    };
  }

  // Проверка возможности стрельбы
  canFire() {
    return this.ammo > 0;
  }

  // Потратить патрон
  consumeAmmo(amount = 1) {
    if (this.ammo >= amount) {
      this.ammo -= amount;
      return true;
    }
    return false;
  }

  // Перезарядка
  reload() {
    this.ammo = this.maxAmmo;
  }

  // Получить иконку оружия
  getIcon() {
    return this.icon;
  }
}

// Алиас для обратной совместимости
const Weapon = BaseWeapon;
