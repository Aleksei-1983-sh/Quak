// Дробовик - оружие ближнего боя с множеством пуль
class Shotgun extends Weapon {
  constructor() {
    super({
      name: 'SHOTGUN',
      type: 'ray_multi',
      damage: 8,
      fireRate: 0.8,
      ammo: 20,
      maxAmmo: 20,
      pellets: 8,
      spread: 0.08,
      sound: 'shotgun',
      color: 0xff8800,
      auto: false,
      icon: '💥'
    });
  }

  // Специфичный метод для дробовика - мощный выстрел (больше пуль, больше разброс)
  powerShot() {
    const originalPellets = this.pellets;
    const originalSpread = this.spread;
    const originalDamage = this.damage;
    
    this.pellets = 12;
    this.spread = 0.12;
    this.damage = 6;
    
    setTimeout(() => {
      this.pellets = originalPellets;
      this.spread = originalSpread;
      this.damage = originalDamage;
    }, 1000);
  }

  // Получить количество пуль
  getPelletCount() {
    return this.pellets;
  }
}
