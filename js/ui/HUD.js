class HUD {
  constructor(game) {
    this.game = game;

    this.els = {
      healthVal: document.getElementById('health-val'),
      armorVal: document.getElementById('armor-val'),
      ammoVal: document.getElementById('ammo-val'),
      ammoType: document.getElementById('ammo-type'),
      scoreVal: document.getElementById('score-val'),
      healthBar: document.getElementById('health-bar'),
      armorBar: document.getElementById('armor-bar'),
      killFeed: document.getElementById('kill-feed'),
      minimapCanvas: document.getElementById('minimap-canvas'),
      weaponIcons: [
        document.getElementById('weapon-icon-1'),
        document.getElementById('weapon-icon-2'),
        document.getElementById('weapon-icon-3'),
        document.getElementById('weapon-icon-4')
      ]
    };

    this.minimapCtx = this.els.minimapCanvas.getContext('2d');
    this.minimapSize = 150;
    
    // Настройки мини-карты будут обновляться динамически
    this.tileSize = 0;
    this.mapOffsetX = 0;
    this.mapOffsetZ = 0;
    this.currentWeaponIndex = 0;
  }

  update() {
    DEBUG.ui.trace('HUD update');
    
    const p = this.game.player;
    const w = p.weapons[this.game.currentWeapon];

    // Проверка валидности данных
    if (!DEBUG.validate(p, 'player', 'UI') || !DEBUG.validate(w, 'weapon', 'UI')) return;

    this.els.healthVal.textContent = Math.ceil(p.health);
    this.els.armorVal.textContent = Math.ceil(p.armor);
    this.els.ammoVal.textContent = w.ammo;
    this.els.ammoType.textContent = `${w.icon} ${w.name}`;
    this.els.scoreVal.textContent = this.game.score;

    this.els.healthBar.style.width = `${(p.health / p.maxHealth) * 100}%`;
    this.els.armorBar.style.width = `${(p.armor / p.maxArmor) * 100}%`;

    // Обновление иконок оружия
    this.updateWeaponIcons();

    const hVal = this.els.healthVal;
    if (p.health < 25) {
      hVal.style.color = '#ff0000';
      DEBUG.ui.warn('Низкое здоровье!');
    } else if (p.health < 50) {
      hVal.style.color = '#ff8800';
    } else {
      hVal.style.color = '#00ff44';
    }
    
    DEBUG.ui.trace('HUD update end');
  }

  // Метод для обновления иконок оружия
  updateWeaponIcons() {
    const weapons = this.game.player.weapons;
    const currentIdx = this.game.currentWeapon;
    
    if (!this.els.weaponIcons || !weapons) return;
    
    weapons.forEach((weapon, idx) => {
      const iconEl = this.els.weaponIcons[idx];
      if (iconEl) {
        // Обновляем иконку и патроны
        iconEl.innerHTML = `${weapon.icon}<span class="weapon-ammo">${weapon.ammo}</span>`;
        
        // Подсветка текущего оружия
        if (idx === currentIdx) {
          iconEl.classList.add('active');
        } else {
          iconEl.classList.remove('active');
        }
        
        // Показываем предупреждение если мало патронов
        if (weapon.ammo <= weapon.maxAmmo * 0.2) {
          iconEl.classList.add('low-ammo');
        } else {
          iconEl.classList.remove('low-ammo');
        }
      }
    });
  }

  showKillFeed(type, score) {
    DEBUG.ui.info(`Kill feed: ${type} +${score}`);
    
    const msg = document.createElement('div');
    msg.className = 'kill-msg';
    msg.textContent = `ELIMINATED ${type.toUpperCase()} +${score}`;
    this.els.killFeed.appendChild(msg);
    setTimeout(() => {
      msg.remove();
      DEBUG.ui.trace('Kill feed message removed');
    }, 3000);
  }

  updateMinimap() {
    DEBUG.ui.trace('updateMinimap start');
    
    const ctx = this.minimapCtx;
    const size = this.minimapSize;

    // Очищаем
    ctx.fillStyle = '#000000cc';
    ctx.fillRect(0, 0, size, size);

    // Получаем доступ к уровню и его карте
    const level = this.game.level;
    if (!level || !level.mapGrid) {
      DEBUG.world.warn('updateMinimap: нет данных уровня');
      return;
    }

    const mapGrid = level.mapGrid;
    const rows = mapGrid.length;
    const cols = mapGrid[0].length;
    const tileSize = level.tileSize || 2;

    // Вычисляем масштаб для мини-карты
    const scale = size / Math.max(rows, cols);

    let tilesDrawn = 0;
    // Рисуем сетку карты
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = mapGrid[row][col];
        const x = col * scale;
        const y = row * scale;
        const w = scale;
        const h = scale;

        // Рисуем в зависимости от типа тайла
        switch (tile) {
          case '#': // Полная стена
            ctx.fillStyle = '#443322';
            ctx.fillRect(x, y, w, h);
            tilesDrawn++;
            break;

          case '=': // Горизонтальная стена
            ctx.fillStyle = '#443322';
            ctx.fillRect(x, y + h * 0.3, w, h * 0.4);
            tilesDrawn++;
            break;

          case '|': // Вертикальная стена
            ctx.fillStyle = '#443322';
            ctx.fillRect(x + w * 0.3, y, w * 0.4, h);
            tilesDrawn++;
            break;

          case 'P': // Колонна
            ctx.fillStyle = '#553311';
            ctx.fillRect(x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.6);
            tilesDrawn++;
            break;

          case 'L': // Фонарь
            ctx.fillStyle = '#ffaa33';
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, w * 0.3, 0, Math.PI * 2);
            ctx.fill();
            tilesDrawn++;
            break;

          case 'E': // Враг grunt
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(x + w * 0.25, y + h * 0.25, w * 0.5, h * 0.5);
            tilesDrawn++;
            break;

          case 'S': // Враг soldier
            ctx.fillStyle = '#ff4400';
            ctx.fillRect(x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.6);
            tilesDrawn++;
            break;

          case 'B': // Враг boss
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(x + w * 0.15, y + h * 0.15, w * 0.7, h * 0.7);
            tilesDrawn++;
            break;

          case 'H': // Здоровье
            ctx.fillStyle = '#00ff44';
            ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4);
            tilesDrawn++;
            break;

          case 'A': // Броня
            ctx.fillStyle = '#4488ff';
            ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4);
            tilesDrawn++;
            break;

          case 'M': // Патроны
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.4, h * 0.4);
            tilesDrawn++;
            break;
        }
      }
    }

    DEBUG.ui.trace(`Мини-карта: ${tilesDrawn} тайлов отрисовано`);

    // Рисуем игрока
    const player = this.game.player;
    if (player && player.position) {
      // Конвертируем 3D координаты в координаты мини-карты
      // Центр карты (0, 0) соответствует середине mapGrid
      const playerCol = (player.position.x / tileSize) + (cols / 2);
      const playerRow = (player.position.z / tileSize) + (rows / 2);

      const px = playerCol * scale;
      const py = playerRow * scale;

      // Тело игрока
      ctx.fillStyle = '#00ff44';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();

      // Направление взгляда
      ctx.strokeStyle = '#00ff44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(
        px - Math.sin(player.yaw) * 8,
        py - Math.cos(player.yaw) * 8
      );
      ctx.stroke();
      
      DEBUG.ui.trace(`Игрок на миникарте: (${px.toFixed(1)}, ${py.toFixed(1)})`);
    }

    // Рамка
    ctx.strokeStyle = '#44440088';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, size, size);
    
    DEBUG.ui.trace('updateMinimap end');
  }
}
