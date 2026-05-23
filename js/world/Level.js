class Level {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.walls = game.walls;

    // ==========================================
    // 🎨 МАТЕРИАЛЫ
    // ==========================================
    this.materials = {
      wall: new THREE.MeshLambertMaterial({ color: 0x443322 }),
      floor: new THREE.MeshLambertMaterial({ color: 0x2a2218 }),
      ceiling: new THREE.MeshLambertMaterial({ color: 0x1a1510 }),
      accent: new THREE.MeshLambertMaterial({ color: 0x553311 }),
      pipe: new THREE.MeshLambertMaterial({ color: 0x664422 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.35, metalness: 0.8 }),
      shade: new THREE.MeshStandardMaterial({ color: 0x120f0e, roughness: 0.95, metalness: 0.05, side: THREE.DoubleSide }),
      shadeInner: new THREE.MeshStandardMaterial({ color: 0xf3e7c9, roughness: 0.85, emissive: new THREE.Color(0xffaa33), emissiveIntensity: 0.08, side: THREE.DoubleSide }),
      bulb: new THREE.MeshBasicMaterial({ color: 0xffffff })
    };

// ==========================================
// 🗺️ КАРТА УРОВНЯ (Quake-style Arena)
// ==========================================
this.mapGrid = [
  "##################################################################",
  "#L..@............................................L...............#",
  "#...............................................................L#",
  "#......................=======...................................#",
  "#......................|.....|...................................#",
  "#......=======..........|..P..|...........=======................#",
  "#......|.....|..........|.....|...........|.....|................#",
  "#..P...|..P..|..........=======...........|..P..|...P............#",
  "#......|.....|............................|.....|................#",
  "#......=======............................=======................#",
  "#...............................................................L#",
  "#....................#########...........................#.......#",
  "#....................#.......#...........................#.......#",
  "#....................#..H....#.......E...................#.......#",
  "#....................#.......#...........................#.......#",
  "#....................#########......M....................#.......#",
  "#........................................................#.......#",
  "#......#########.............................#########...........#",
  "#......#.......#.............................#.......#...........#",
  "#......#..M....#.........=======.............#..H....#...........#",
  "#......#.......#.........|..S..|.............#.......#...........#",
  "#......#########.........=======.............#########...........#",
  "#...............................................................E#",
  "#................................P...............................#",
  "#......#########.......................#########.................#",
  "#......#.......#.......................#.......#.................#",
  "#......#..B....#.......................#..M....#.................#",
  "#......#.......#.......................#.......#.................#",
  "#......#########.......................#########.................#",
  "#...............................................................L#",
  "#.............L..................................................#",
  "##################################################################"
];

    // ==========================================
    // ⚙️ НАСТРОЙКИ
    // ==========================================
    this.tileSize = 2;
    this.wallHeight = 4;
    this.ceilingHeight = 4;

    // Вычисляем размеры карты
    this.rows = this.mapGrid.length;
    this.cols = this.mapGrid[0].length;
    this.mapWidth = this.cols * this.tileSize;
    this.mapDepth = this.rows * this.tileSize;

    // ==========================================
    // 🏗️ ГЕНЕРАЦИЯ
    // ==========================================
    this.buildLevel();
  }

  buildLevel() {
    this.buildFloorAndCeiling();

    // Проходим по ВСЕЙ карте и создаём ВСЁ
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const tile = this.mapGrid[row][col];
        
        // Конвертируем row/col в 3D координаты
        // Центр карты (0, 0) находится в середине
        const x = (col - this.cols / 2) * this.tileSize + this.tileSize / 2;
        const z = (row - this.rows / 2) * this.tileSize + this.tileSize / 2;

        this.buildTile(tile, x, z, row, col);
      }
    }

    this.buildPipes();

    // В конце метода добавьте:
    console.log(`✅ Level built: ${this.cols}x${this.rows} tiles, ${this.walls.length} walls`);
    console.log(`📐 World size: ${this.mapWidth}m x ${this.mapDepth}m`);
  }

  buildTile(tile, x, z, row, col) {
    switch (tile) {
      case '#': // Полная стена
        this.addWall(x, this.wallHeight / 2, z, this.tileSize, this.wallHeight, this.tileSize, 'wall');
        break;

      case '=': // Горизонтальная стена
        this.addWall(x, this.wallHeight / 2, z, this.tileSize, this.wallHeight, 0.5, 'wall');
        break;

      case '|': // Вертикальная стена
        this.addWall(x, this.wallHeight / 2, z, 0.5, this.wallHeight, this.tileSize, 'wall');
        break;

      case '@': // Игрок
        this.game.player.position.set(x, 1.7, z);
        break;

      case 'E':
        this.spawnEnemy(x, z, 'grunt');
        break;

      case 'S':
        this.spawnEnemy(x, z, 'soldier');
        break;

      case 'B':
        this.spawnEnemy(x, z, 'boss');
        break;

      case 'L':
        this.addDetailedLamp(x, this.ceilingHeight - 0.6, z, 0xffaa33, 3.0);
        break;

      case 'H':
        this.spawnPickup(x, z, 'health');
        break;

      case 'A':
        this.spawnPickup(x, z, 'armor');
        break;

      case 'M':
        this.spawnPickup(x, z, 'ammo');
        break;

      case 'P':
        this.addPillar(x, z);
        break;
    }
  }

  buildFloorAndCeiling() {
    // Пол
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(this.mapWidth, this.mapDepth),
      this.materials.floor
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Потолок
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(this.mapWidth, this.mapDepth),
      this.materials.ceiling
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = this.ceilingHeight;
    this.scene.add(ceil);
  }

  addWall(x, y, z, w, h, d, matKey) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, this.materials[matKey]);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // ВАЖНО: Создаём коллизию с небольшим запасом
    this.walls.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minY: y - h / 2,
      maxY: y + h / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2
    });
  }

  addPillar(x, z) {
    const geo = new THREE.BoxGeometry(1, this.wallHeight, 1);
    const mesh = new THREE.Mesh(geo, this.materials.accent);
    mesh.position.set(x, this.wallHeight / 2, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.walls.push({
      minX: x - 0.5,
      maxX: x + 0.5,
      minY: 0,
      maxY: this.wallHeight,
      minZ: z - 0.5,
      maxZ: z + 0.5
    });
  }

  buildPipes() {
    for (let i = 0; i < 6; i++) {
      const x = -(this.cols / 2) * this.tileSize + 10 + i * 10;
      const z = -(this.rows / 2) * this.tileSize + 5;
      
      const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 50, 8);
      const pipe = new THREE.Mesh(pipeGeo, this.materials.pipe);
      pipe.position.set(x, 3.5, z + (i % 2) * 20);
      pipe.rotation.z = Math.PI / 2;
      this.scene.add(pipe);
    }
  }

  spawnEnemy(x, z, type) {
    const enemy = new Enemy(x, z, type, this.game);
    this.game.enemies.push(enemy);
    this.game.totalEnemies++;
  }

  spawnPickup(x, z, type) {
    const colors = { health: 0x00ff44, armor: 0x4488ff, ammo: 0xffaa00 };
    const geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const mat = new THREE.MeshBasicMaterial({ color: colors[type] });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0.5, z);

    const glowGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: colors[type], transparent: true, opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    mesh.add(glow);

    this.scene.add(mesh);
    this.game.pickups.push({
      position: new THREE.Vector3(x, 0.5, z),
      type, mesh, active: true
    });
  }

  addDetailedLamp(x, y, z, color, intensity) {
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);
    this.scene.add(lamp);

    const rodGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.45, 12);
    const rod = new THREE.Mesh(rodGeo, this.materials.metal);
    rod.position.y = 0.46;
    lamp.add(rod);

    const capGeo = new THREE.CylinderGeometry(0.10, 0.12, 0.08, 20);
    const cap = new THREE.Mesh(capGeo, this.materials.metal);
    cap.position.y = 0.70;
    lamp.add(cap);

    const connGeo = new THREE.ConeGeometry(0.06, 0.10, 16);
    const conn = new THREE.Mesh(connGeo, this.materials.metal);
    conn.rotation.x = Math.PI;
    conn.position.y = 0.58;
    lamp.add(conn);

    const profile = [
      new THREE.Vector2(0.04, 0.00),
      new THREE.Vector2(0.10, -0.03),
      new THREE.Vector2(0.25, -0.11),
      new THREE.Vector2(0.42, -0.24),
      new THREE.Vector2(0.58, -0.42),
      new THREE.Vector2(0.66, -0.62),
      new THREE.Vector2(0.68, -0.76),
      new THREE.Vector2(0.65, -0.84)
    ];
    const shadeGeo = new THREE.LatheGeometry(profile, 48);
    const shade = new THREE.Mesh(shadeGeo, this.materials.shade);
    shade.position.y = 0.08;
    lamp.add(shade);

    const rimGeo = new THREE.TorusGeometry(0.66, 0.025, 12, 48);
    const rim = new THREE.Mesh(rimGeo, this.materials.metal);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.76;
    lamp.add(rim);

    const innerGeo = new THREE.ConeGeometry(0.52, 0.62, 32, 1, true);
    const inner = new THREE.Mesh(innerGeo, this.materials.shadeInner);
    inner.material.emissive.setHex(color);
    inner.position.y = -0.34;
    lamp.add(inner);

    const bulbGeo = new THREE.SphereGeometry(0.10, 20, 20);
    const bulb = new THREE.Mesh(bulbGeo, this.materials.bulb);
    bulb.material.color.setHex(color);
    bulb.position.y = -0.30;
    lamp.add(bulb);

    const point = new THREE.PointLight(color, intensity * 8, 28, 2);
    point.position.y = -0.32;
    lamp.add(point);

    const spot = new THREE.SpotLight(color, intensity * 3.5, 35, Math.PI / 6.5, 0.65, 1.6);
    spot.position.y = -0.10;
    spot.target.position.set(0, -10, 0);
    lamp.add(spot);
    lamp.add(spot.target);

    const beamHeight = y + 0.6;
    const beamRadius = 2.2;
    const beamGeo = new THREE.CylinderGeometry(0.02, beamRadius, beamHeight, 40, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(x, y - beamHeight / 2, z);
    this.scene.add(beam);
  }

  rebuild() {
    // Очистка
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const obj = this.scene.children[i];
      if (obj !== this.game.camera) {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    }

    this.walls = [];
    this.game.enemies = [];
    this.game.pickups = [];
    this.game.totalEnemies = 0;

    this.rows = this.mapGrid.length;
    this.cols = this.mapGrid[0].length;
    this.mapWidth = this.cols * this.tileSize;
    this.mapDepth = this.rows * this.tileSize;

    this.buildLevel();
  }

  printMap() {
    console.log('\n=== LEVEL MAP ===');
    this.mapGrid.forEach(row => console.log(row));
    console.log('================\n');
  }

  // Отладка: показать все стены коллизий
  debugWalls() {
    console.log(`\nTotal walls: ${this.walls.length}`);
    this.walls.forEach((w, i) => {
      console.log(`Wall ${i}: X[${w.minX.toFixed(1)}:${w.maxX.toFixed(1)}] Z[${w.minZ.toFixed(1)}:${w.maxZ.toFixed(1)}]`);
    });
  }
}

















































/*
class Level {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.walls = game.walls;

    const wallMat = new THREE.MeshLambertMaterial({ color: 0x443322 });
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x2a2218 });
    const ceilMat = new THREE.MeshLambertMaterial({ color: 0x1a1510 });
    const accentMat = new THREE.MeshLambertMaterial({ color: 0x553311 });

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 4;
    this.scene.add(ceil);

    const addWall = (x, y, z, w, h, d, mat) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat || wallMat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      this.walls.push({
        minX: x - w / 2, maxX: x + w / 2,
        minY: y - h / 2, maxY: y + h / 2,
        minZ: z - d / 2, maxZ: z + d / 2
      });
    };

    const S = 30;

    // Outer walls
    addWall(0, 2, -S, 60, 4, 0.5);
    addWall(0, 2, S, 60, 4, 0.5);
    addWall(-S, 2, 0, 0.5, 4, 60);
    addWall(S, 2, 0, 0.5, 4, 60);

    // Interior corridors
    addWall(0, 2, -8, 0.5, 4, 16);
    addWall(0, 2, 8, 0.5, 4, 16);
    addWall(-8, 2, 0, 16, 4, 0.5);
    addWall(8, 2, 0, 16, 4, 0.5);

    // Inner rooms
    addWall(-14, 2, -5, 8, 4, 0.5);
    addWall(-14, 2, 5, 8, 4, 0.5);
    addWall(14, 2, -5, 8, 4, 0.5);
    addWall(14, 2, 5, 8, 4, 0.5);

    // Pillars
    for (let i = -2; i <= 2; i++) {
      addWall(i * 5, 2, -15, 1, 4, 1, accentMat);
      addWall(i * 5, 2, 15, 1, 4, 1, accentMat);
    }

    // Extra walls
    addWall(-5, 2, -12, 0.5, 4, 8);
    addWall(5, 2, 12, 0.5, 4, 8);
    addWall(-12, 2, 12, 8, 4, 0.5);
    addWall(12, 2, -12, 8, 4, 0.5);

    // Platforms
    addWall(-20, 1, -20, 4, 2, 4, accentMat);
    addWall(20, 1, 20, 4, 2, 4, accentMat);
    addWall(0, 1, 0, 3, 2, 3, accentMat);

    this.setupDecorations();
    this.setupLights();
  }

  setupDecorations() {
    const pipeMat = new THREE.MeshLambertMaterial({ color: 0x664422 });
    for (let i = 0; i < 6; i++) {
      const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 50, 8);
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.position.set(-25 + i * 10, 3.5, -10 + (i % 2) * 20);
      this.scene.add(pipe);
    }
  }

setupLights() {
  const addLight = (x, y, z, color, intensity) => {
    // Материалы
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.35,
      metalness: 0.8
    });

    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x120f0e,
      roughness: 0.95,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xf3e7c9,
      roughness: 0.85,
      metalness: 0.0,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide
    });

    const bulbMat = new THREE.MeshBasicMaterial({
      color: color
    });

    // Группа светильника
    const lamp = new THREE.Group();
    lamp.position.set(x, y, z);
    this.scene.add(lamp);

    // ==========================================
    // 1. ПОДВЕС / ШТАНГА
    // ==========================================
    const rodGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.45, 12);
    const rod = new THREE.Mesh(rodGeo, metalMat);
    rod.position.y = 0.46;
    lamp.add(rod);

    // Маленькая верхняя крышка
    const capGeo = new THREE.CylinderGeometry(0.10, 0.12, 0.08, 20);
    const cap = new THREE.Mesh(capGeo, metalMat);
    cap.position.y = 0.70;
    lamp.add(cap);

    // Маленький конус/узел крепления
    const connectorGeo = new THREE.ConeGeometry(0.06, 0.10, 16);
    const connector = new THREE.Mesh(connectorGeo, metalMat);
    connector.rotation.x = Math.PI;
    connector.position.y = 0.58;
    lamp.add(connector);

    // ==========================================
    // 2. ПЛАФОН — более реалистичный профиль
    //    (не идеальный конус, а чуть “живой” силуэт)
    // ==========================================
    const profile = [
      new THREE.Vector2(0.04,  0.00),  // верхнее отверстие
      new THREE.Vector2(0.10, -0.03),
      new THREE.Vector2(0.25, -0.11),
      new THREE.Vector2(0.42, -0.24),
      new THREE.Vector2(0.58, -0.42),
      new THREE.Vector2(0.66, -0.62),
      new THREE.Vector2(0.68, -0.76),
      new THREE.Vector2(0.65, -0.84)   // нижняя кромка
    ];

    const shadeGeo = new THREE.LatheGeometry(profile, 48);
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.y = 0.08;
    lamp.add(shade);

    // Нижнее кольцо, чтобы кромка выглядела настоящей
    const rimGeo = new THREE.TorusGeometry(0.66, 0.025, 12, 48);
    const rim = new THREE.Mesh(rimGeo, metalMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.76;
    lamp.add(rim);

    // ==========================================
    // 3. ВНУТРЕННЯЯ ЧАСТЬ ПЛАФОНА
    // ==========================================
    const innerGeo = new THREE.ConeGeometry(0.52, 0.62, 32, 1, true);
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.y = -0.34;
    lamp.add(inner);

    // ==========================================
    // 4. ЛАМПОЧКА
    // ==========================================
    const bulbGeo = new THREE.SphereGeometry(0.10, 20, 20);
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = -0.30;
    lamp.add(bulb);

    // ==========================================
    // 5. ОСНОВНОЙ СВЕТ
    // ==========================================
    const point = new THREE.PointLight(color, intensity * 8, 28, 2);
    point.position.y = -0.32;
    lamp.add(point);

    // Мягкий направленный свет вниз
    const spot = new THREE.SpotLight(color, intensity * 3.5, 35, Math.PI / 6.5, 0.65, 1.6);
    spot.position.y = -0.10;
    spot.target.position.set(0, -10, 0);
    lamp.add(spot);
    lamp.add(spot.target);

    // ==========================================
    // 6. МЯГКОЕ СВЕЧЕНИЕ ВНИЗ
    // ==========================================
    // Если хочешь более реалистично — этот луч можно сильно ослабить
    const beamHeight = y;
    const beamRadius = 2.2;

    const beamGeo = new THREE.CylinderGeometry(0.02, beamRadius, beamHeight, 40, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(x, y - beamHeight / 2, z);
    this.scene.add(beam);
  };

  // ==========================================
  // РАССТАНОВКА ЛАМП
  // ==========================================
  addLight(0, 3.4, 0, 0xffaa33, 3.0);
  addLight(0, 3.4, -15, 0xffaa33, 2.8);
  addLight(0, 3.4, 15, 0xffaa33, 2.8);

  addLight(-15, 3.4, -15, 0xff5500, 3.5);
  addLight(15, 3.4, 15, 0xff5500, 3.5);
  addLight(-15, 3.4, 15, 0xff6622, 3.5);
  addLight(15, 3.4, -15, 0xff6622, 3.5);

  addLight(-20, 3.4, 0, 0x88ff88, 3.0);
  addLight(20, 3.4, 0, 0x88ff88, 3.0);
}
}*/
