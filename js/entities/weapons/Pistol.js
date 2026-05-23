// Пистолет - базовое оружие с низким уроном но высокой точностью
class Pistol extends Weapon {
  constructor() {
    super({
      name: 'PISTOL',
      type: 'ray',
      damage: 15,
      fireRate: 0.25,
      ammo: 50,
      maxAmmo: 50,
      spread: 0.01,
      sound: 'pistol',
      color: 0x888888,
      auto: false,
      icon: '🔫'
    });
  }

  // Специфичный метод для пистолета - быстрый выстрел (меньше урона, быстрее скорострельность)
  quickShot() {
    const originalDamage = this.damage;
    const originalFireRate = this.fireRate;
    this.damage = 10;
    this.fireRate = 0.15;
    
    setTimeout(() => {
      this.damage = originalDamage;
      this.fireRate = originalFireRate;
    }, 500);
  }
}
