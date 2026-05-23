class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, dx: 0, dy: 0, left: false, right: false };
    this.pointerLocked = false;
    this.targetElement = null;
    
    DEBUG.input.log('InputManager инициализация...');

    // Клавиатура (объединено в один слушатель)
    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      DEBUG.input.trace(`Key down: ${e.code}`);
      
      // F2 — переключение отладочной панели
      if (e.code === 'F2') {
        const panel = document.getElementById('debug-panel');
        if (panel) {
          panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
          DEBUG.input.info(`Debug panel: ${panel.style.display}`);
        }
      }
    });

    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      DEBUG.input.trace(`Key up: ${e.code}`);
    });

    // Движение мыши
    document.addEventListener('mousemove', e => {
      if (this.pointerLocked) {
        this.mouse.dx += e.movementX;
        this.mouse.dy += e.movementY;
      }
    });

    // Кнопки мыши
    document.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.mouse.left = true;
        DEBUG.input.trace('Mouse left down');
      }
      if (e.button === 2) {
        this.mouse.right = true;
        DEBUG.input.trace('Mouse right down');
      }
    });

    document.addEventListener('mouseup', e => {
      if (e.button === 0) {
        this.mouse.left = false;
        DEBUG.input.trace('Mouse left up');
      }
      if (e.button === 2) {
        this.mouse.right = false;
        DEBUG.input.trace('Mouse right up');
      }
    });

    // Блокировка контекстного меню (ПКМ)
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      DEBUG.input.trace('Context menu prevented');
    });
    
    DEBUG.input.log('InputManager готов');
  }

  lock(element) {
    this.targetElement = element;
    DEBUG.input.info('Запрос на блокировку курсора');
    element.requestPointerLock();

    // Отслеживаем изменение состояния захвата мыши
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === element;
      DEBUG.input.info(`Pointer lock: ${this.pointerLocked ? 'активен' : 'деактивирован'}`);

      // Показываем/скрываем оверлей паузы
      const overlay = document.getElementById('pause-overlay');
      if (overlay) {
        overlay.style.display = this.pointerLocked ? 'none' : 'flex';
      }
    });

    // Возврат захвата при клике по экрану игры
    element.addEventListener('click', () => {
      if (!this.pointerLocked && this.targetElement) {
        DEBUG.input.log('Повторный запрос на блокировку курсора');
        this.targetElement.requestPointerLock();
      }
    });
    
    DEBUG.input.log('lock() завершен');
  }

  isPressed(code) { return !!this.keys[code]; }
}
