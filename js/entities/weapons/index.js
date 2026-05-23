// Экспорт всех классов оружия
// Этот файл подключает все классы оружия и делает их доступными

// Сначала должен быть загружен базовый класс Weapon
// Порядок подключения в HTML важен!

// Мета-данные анимации оружия (должны быть загружены первыми)
// WEAPON_ANIMATION_META определяется в WeaponMeta.js

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BaseWeapon,
    Pistol,
    Rifle,
    Shotgun,
    RocketLauncher
  };
}
