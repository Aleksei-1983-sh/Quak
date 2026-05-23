// Ракетница - оружие с проектами и взрывным уроном
class RocketLauncher extends Weapon {
  constructor() {
    super({
      name: 'ROCKET LAUNCHER',
      type: 'projectile',
      damage: 100,
      fireRate: 0.7,
      ammo: 10,
      maxAmmo: 10,
      spread: 0.01,
      sound: 'rocket',
      color: 0xff4400,
      auto: false,
      icon: '🚀'
    });
  }

  // Специфичный метод для ракетницы - залп (быстрее скорострельность но меньше урон)
  rapidFire() {
    const originalFireRate = this.fireRate;
    const originalDamage = this.damage;
    
    this.fireRate = 0.4;
    this.damage = 70;
    
    setTimeout(() => {
      this.fireRate = originalFireRate;
      this.damage = originalDamage;
    }, 2000);
  }

  // Получить радиус взрыва
  getExplosionRadius() {
    return 5;
  }
}
