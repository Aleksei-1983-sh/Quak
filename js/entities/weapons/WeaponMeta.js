// ==========================================
// 📊 МЕТА-ДАННЫЕ ОРУЖИЯ
// ==========================================
// Здесь хранятся все настройки анимаций для каждого типа оружия.
// Изменяйте эти значения для балансировки ощущения от стрельбы.

const WEAPON_ANIMATION_META = {
  // === ПИСТОЛЕТ ===
  pistol: {
    // Покачивание в покое (когда игрок стоит)
    idleSway: {
      amount: 0.005,        // Амплитуда покачивания
      speed: 0.002          // Скорость покачивания (рад/мс)
    },
    
    // Покачивание при ходьбе
    walkSway: {
      amountX: 0.15,        // Боковое смещение
      amountY: 0.03,        // Вертикальная тряска
      amountZ: 0.15,        // Смещение вперед-назад
      speed: 0.01,          // Скорость циклического покачивания
      lerpFactor: 0.15      // Плавность достижения целевого значения
    },
    
    // Покачивание при беге (умножается на walkSway)
    runSwayMultiplier: 1.5, // Коэффициент усиления при беге
    
    // Отдача при выстреле
    recoil: {
      velocity: -5.0,       // Сила отдачи назад (по оси Z)
      muzzleRise: 0.05,     // Подъем ствола вверх (рад/кадр)
      sideTilt: 0.02,       // Боковой наклон (случайный разброс)
      returnSpeed: 0.2      // Скорость возврата в исходное положение
    }
  },
  
  // === ВИНТОВКА (PULSE RIFLE) ===
  rifle: {
    idleSway: {
      amount: 0.004,
      speed: 0.002
    },
    
    walkSway: {
      amountX: 0.12,
      amountY: 0.025,
      amountZ: 0.12,
      speed: 0.012,
      lerpFactor: 0.15
    },
    
    runSwayMultiplier: 1.4,
    
    recoil: {
      velocity: -8.0,
      muzzleRise: 0.03,
      sideTilt: 0.015,
      returnSpeed: 0.25
    }
  },
  
  // === ДРОБОВИК ===
  shotgun: {
    idleSway: {
      amount: 0.006,
      speed: 0.002
    },
    
    walkSway: {
      amountX: 0.18,
      amountY: 0.04,
      amountZ: 0.18,
      speed: 0.009,
      lerpFactor: 0.15
    },
    
    runSwayMultiplier: 1.6,
    
    recoil: {
      velocity: -15.0,      // Очень сильная отдача
      muzzleRise: 0.12,     // Сильный подъем ствола
      sideTilt: 0.03,
      returnSpeed: 0.15     // Медленный возврат
    }
  },
  
  // === РОКЕТНИЦА ===
  rocketLauncher: {
    idleSway: {
      amount: 0.03,         // Сильное покачивание (тяжелое оружие)
      speed: 0.003
    },
    
    walkSway: {
      amountX: 0.2,         // Большое смещение из-за веса
      amountY: 0.05,        // Сильная вертикальная тряска
      amountZ: 0.2,
      speed: 0.008,         // Медленное покачивание
      lerpFactor: 0.12      // Более плавное движение
    },
    
    runSwayMultiplier: 1.3, // Меньше влияет бег из-за веса
    
    recoil: {
      velocity: -18.0,      // Максимальная отдача
      muzzleRise: 0.25,     // Очень сильный подъем ствола
      sideTilt: 0.04,       // Заметный боковой наклон
      returnSpeed: 0.18     // Медленный возврат (тяжелое оружие)
    }
  }
};

// Функция для получения мета-данных по типу оружия
function getWeaponAnimationMeta(weaponType) {
  return WEAPON_ANIMATION_META[weaponType] || WEAPON_ANIMATION_META.pistol;
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WEAPON_ANIMATION_META, getWeaponAnimationMeta };
}
