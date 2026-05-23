/**
 * Debug System - Гибкая система отладки для игры
 * Позволяет включать/выключать логи по категориям и уровням важности
 */

const DEBUG = {
  // Глобальный переключатель - установите false чтобы выключить ВСЕ логи
  ENABLED: true,
  
  // Настройки по категориям (включить/выключить конкретные модули)
  CATEGORIES: {
    CORE: true,        // GameEngine, основной цикл
    INPUT: true,       // InputManager, управление
    AUDIO: true,       // AudioSystem, звуки
    RENDER: true,      // Renderer, отрисовка
    ENTITY: true,      // Player, Enemy, сущности
    WORLD: true,       // Level, Collision, Props
    UI: true,          // HUD, интерфейс
    COMBAT: true,      // Стрельба, попадания, урон
    PHYSICS: true,     // Коллизии, движение
    PERF: true         // Производительность, FPS
  },
  
  // Уровни важности логов
  LEVELS: {
    LOG: 1,    // Обычные сообщения
    INFO: 2,   // Информативные (состояния, переходы)
    WARN: 3,   // Предупреждения (некритичные ошибки)
    ERROR: 4,  // Ошибки (критичные проблемы)
    TRACE: 5   // Трассировка (детальный поток выполнения)
  },
  
  // Текущий минимальный уровень для вывода (например, только WARN и ERROR)
  MIN_LEVEL: this.LEVELS.LOG,
  
  // Префиксы для категорий
  PREFIXES: {
    CORE: '[CORE]',
    INPUT: '[INPUT]',
    AUDIO: '[AUDIO]',
    RENDER: '[RENDER]',
    ENTITY: '[ENTITY]',
    WORLD: '[WORLD]',
    UI: '[UI]',
    COMBAT: '[COMBAT]',
    PHYSICS: '[PHYSICS]',
    PERF: '[PERF]'
  },
  
  // Цвета для категорий (для консоли)
  COLORS: {
    CORE: '#00ff44',
    INPUT: '#4488ff',
    AUDIO: '#ffaa00',
    RENDER: '#ff44ff',
    ENTITY: '#00ffff',
    WORLD: '#88ff44',
    UI: '#ff6600',
    COMBAT: '#ff0044',
    PHYSICS: '#ffff00',
    PERF: '#ff00ff'
  },
  
  // Внутренний счетчик сообщений для отладки
  _messageCount: 0,
  
  /**
   * Основной метод логирования
   * @param {string} category - Категория лога (из CATEGORIES)
   * @param {string} level - Уровень лога (LOG, INFO, WARN, ERROR, TRACE)
   * @param {string} message - Сообщение
   * @param {...any} data - Дополнительные данные
   */
  log(category, level, message, ...data) {
    if (!this.ENABLED) return;
    if (!this.CATEGORIES[category]) return;
    
    const levelNum = this.LEVELS[level];
    if (!levelNum || levelNum < this.MIN_LEVEL) return;
    
    const prefix = this.PREFIXES[category] || `[${category}]`;
    const color = this.COLORS[category] || '#ffffff';
    const timestamp = new Date().toLocaleTimeString('ru-RU', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
    
    this._messageCount++;
    
    // Формируем заголовок с эмодзи для уровня
    let levelIcon = '';
    switch (level) {
      case 'LOG': levelIcon = '📝'; break;
      case 'INFO': levelIcon = 'ℹ️'; break;
      case 'WARN': levelIcon = '⚠️'; break;
      case 'ERROR': levelIcon = '❌'; break;
      case 'TRACE': levelIcon = '🔍'; break;
    }
    
    const header = `%c${timestamp} ${levelIcon} ${prefix}`;
    const style = `color: ${color}; font-weight: bold; font-family: monospace;`;
    
    if (data.length > 0) {
      console.log(header, style, `[${level}] ${message}`, ...data);
    } else {
      console.log(header, style, `[${level}] ${message}`);
    }
  },
  
  // === УДОБНЫЕ МЕТОДЫ-МАКРОСЫ ДЛЯ КАЖДОЙ КАТЕГОРИИ ===
  
  // CORE
  core: {
    log: (msg, ...data) => DEBUG.log('CORE', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('CORE', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('CORE', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('CORE', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('CORE', 'TRACE', msg, ...data)
  },
  
  // INPUT
  input: {
    log: (msg, ...data) => DEBUG.log('INPUT', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('INPUT', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('INPUT', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('INPUT', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('INPUT', 'TRACE', msg, ...data)
  },
  
  // AUDIO
  audio: {
    log: (msg, ...data) => DEBUG.log('AUDIO', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('AUDIO', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('AUDIO', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('AUDIO', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('AUDIO', 'TRACE', msg, ...data)
  },
  
  // RENDER
  render: {
    log: (msg, ...data) => DEBUG.log('RENDER', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('RENDER', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('RENDER', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('RENDER', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('RENDER', 'TRACE', msg, ...data)
  },
  
  // ENTITY
  entity: {
    log: (msg, ...data) => DEBUG.log('ENTITY', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('ENTITY', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('ENTITY', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('ENTITY', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('ENTITY', 'TRACE', msg, ...data)
  },
  
  // WORLD
  world: {
    log: (msg, ...data) => DEBUG.log('WORLD', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('WORLD', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('WORLD', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('WORLD', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('WORLD', 'TRACE', msg, ...data)
  },
  
  // UI
  ui: {
    log: (msg, ...data) => DEBUG.log('UI', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('UI', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('UI', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('UI', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('UI', 'TRACE', msg, ...data)
  },
  
  // COMBAT
  combat: {
    log: (msg, ...data) => DEBUG.log('COMBAT', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('COMBAT', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('COMBAT', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('COMBAT', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('COMBAT', 'TRACE', msg, ...data)
  },
  
  // PHYSICS
  physics: {
    log: (msg, ...data) => DEBUG.log('PHYSICS', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('PHYSICS', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('PHYSICS', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('PHYSICS', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('PHYSICS', 'TRACE', msg, ...data)
  },
  
  // PERF
  perf: {
    log: (msg, ...data) => DEBUG.log('PERF', 'LOG', msg, ...data),
    info: (msg, ...data) => DEBUG.log('PERF', 'INFO', msg, ...data),
    warn: (msg, ...data) => DEBUG.log('PERF', 'WARN', msg, ...data),
    error: (msg, ...data) => DEBUG.log('PERF', 'ERROR', msg, ...data),
    trace: (msg, ...data) => DEBUG.log('PERF', 'TRACE', msg, ...data)
  },
  
  /**
   * Включить все логи
   */
  enableAll() {
    this.ENABLED = true;
    Object.keys(this.CATEGORIES).forEach(key => {
      this.CATEGORIES[key] = true;
    });
    this.MIN_LEVEL = this.LEVELS.LOG;
    console.log('%c✅ DEBUG: Все логи включены', 'color: #00ff44; font-weight: bold;');
  },
  
  /**
   * Выключить все логи
   */
  disableAll() {
    this.ENABLED = false;
    console.log('%c❌ DEBUG: Все логи выключены', 'color: #ff4444; font-weight: bold;');
  },
  
  /**
   * Установить уровень логирования
   * @param {string} level - 'LOG', 'INFO', 'WARN', 'ERROR', 'TRACE'
   */
  setLevel(level) {
    if (this.LEVELS[level]) {
      this.MIN_LEVEL = this.LEVELS[level];
      console.log(`%c📊 DEBUG: Уровень установлен на ${level}`, 'color: #4488ff; font-weight: bold;');
    }
  },
  
  /**
   * Включить/выключить конкретную категорию
   * @param {string} category - Название категории
   * @param {boolean} enabled - Включить или выключить
   */
  setCategory(category, enabled) {
    if (this.CATEGORIES.hasOwnProperty(category.toUpperCase())) {
      this.CATEGORIES[category.toUpperCase()] = enabled;
      const status = enabled ? '✅' : '❌';
      console.log(`%c${status} DEBUG: Категория ${category} ${enabled ? 'включена' : 'выключена'}`, 
        'color: #ffaa00; font-weight: bold;');
    }
  },
  
  /**
   * Получить статистику логов
   */
  getStats() {
    return {
      totalMessages: this._messageCount,
      enabled: this.ENABLED,
      categories: { ...this.CATEGORIES },
      minLevel: Object.keys(this.LEVELS).find(key => this.LEVELS[key] === this.MIN_LEVEL)
    };
  },
  
  /**
   * Проверка значения на валидность (помощник для отладки)
   * @param {any} value - Значение для проверки
   * @param {string} name - Имя переменной
   * @param {string} category - Категория для лога
   * @returns {boolean} - true если значение валидно
   */
  validate(value, name, category = 'CORE') {
    if (value === null || value === undefined) {
      this.log(category, 'ERROR', `NULL/UNDEFINED: ${name} = ${value}`);
      return false;
    }
    if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
      this.log(category, 'ERROR', `INVALID NUMBER: ${name} = ${value}`);
      return false;
    }
    return true;
  },
  
  /**
   * Замер времени (профилирование)
   * @param {string} label - Метка для замера
   * @param {string} category - Категория
   */
  time(label, category = 'PERF') {
    if (!this.ENABLED || !this.CATEGORIES[category]) return;
    console.time(`${this.PREFIXES[category]} ${label}`);
  },
  
  /**
   * Завершение замера времени
   * @param {string} label - Метка для замера
   * @param {string} category - Категория
   */
  timeEnd(label, category = 'PERF') {
    if (!this.ENABLED || !this.CATEGORIES[category]) return;
    console.timeEnd(`${this.PREFIXES[category]} ${label}`);
  }
};

// Добавляем глобальный объект для доступа из консоли браузера
window.DEBUG_SYSTEM = DEBUG;

// Автолог при загрузке
console.log('%c🔧 DEBUG SYSTEM LOADED', 'color: #00ff44; font-weight: bold; font-size: 14px;');
console.log('%cUse DEBUG.enableAll() / DEBUG.disableAll() to toggle logs', 'color: #888888; font-style: italic;');
console.log('%cUse DEBUG.setCategory("CATEGORY", false) to toggle specific categories', 'color: #888888; font-style: italic;');
