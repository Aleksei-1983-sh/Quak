// Экспорт всех классов оружия
// Этот файл подключает все классы оружия и делает их доступными
// js/entities/weapons/index.js

import { Weapon } from './Weapon.js';
import { Pistol } from './Pistol.js';
import { Rifle } from './Rifle.js';
import { Shotgun } from './Shotgun.js';
import { RocketLauncher } from './RocketLauncher.js';

export {
    Weapon,
    Pistol,
    Rifle,
    Shotgun,
    RocketLauncher
};
// Сначала должен быть загружен базовый класс Weapon
// Порядок подключения в HTML важен!
