# Quake2 Browser

Web-based Quake2 game browser built with Three.js and Web Audio API.

# Создайте структуру папок
mkdir -p quake2-browser/css
mkdir -p quake2-browser/js/{core,renderer,world,entities,ui}

# Скопируйте содержимое каждого файла в соответствующий файл

# Запустите локальный сервер (Three.js требует HTTPS/localhost)
cd quake2-browser
python3 -m http.server 8080
# или
npx serve .

# Откройте в браузере: http://localhost:8080

## Структура проекта
