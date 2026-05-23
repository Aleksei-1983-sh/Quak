// Винтовка (Pulse Rifle) - базовое автоматическое оружие
class Rifle extends Weapon {
  constructor() {
    super({
      name: 'PULSE RIFLE',
      type: 'ray',
      damage: 12,
      fireRate: 0.15,
      ammo: 200,
      maxAmmo: 200,
      spread: 0.02,
      sound: 'pulse_rifle',
      color: 0x00ff44,
      auto: true,
      icon: '🔫'
    });
  }

  // Специфичный метод для винтовки - режим точной стрельбы
  setPrecisionMode(precision) {
    if (precision) {
      this.spread = 0.01;
      this.fireRate = 0.3;
    } else {
      this.spread = 0.02;
      this.fireRate = 0.15;
    }
  }
}
