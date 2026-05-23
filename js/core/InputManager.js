class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, dx: 0, dy: 0, left: false, right: false };
    this.pointerLocked = false;
    this.targetElement = null;

    // Клавиатура (объединено в один слушатель)
    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      
      // F2 — переключение отладочной панели
      if (e.code === 'F2') {
        const panel = document.getElementById('debug-panel');
        if (panel) {
          panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
      }
    });

    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
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
      if (e.button === 0) this.mouse.left = true;
      if (e.button === 2) this.mouse.right = true;
    });

    document.addEventListener('mouseup', e => {
      if (e.button === 0) this.mouse.left = false;
      if (e.button === 2) this.mouse.right = false;
    });

    // Блокировка контекстного меню (ПКМ)
    document.addEventListener('contextmenu', e => e.preventDefault());
  }

  lock(element) {
    this.targetElement = element;
    element.requestPointerLock();

    // Отслеживаем изменение состояния захвата мыши
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === element;

      // Показываем/скрываем оверлей паузы
      const overlay = document.getElementById('pause-overlay');
      if (overlay) {
        overlay.style.display = this.pointerLocked ? 'none' : 'flex';
      }
    });

    // Возврат захвата при клике по экрану игры
    element.addEventListener('click', () => {
      if (!this.pointerLocked && this.targetElement) {
        this.targetElement.requestPointerLock();
      }
    });
  }

  isPressed(code) { return !!this.keys[code]; }
}
