# AGENTS.md - Project State & Guidelines

## 📊 Project Snapshot (Current State)

**Project Name:** Quake2 Browser  
**Description:** Web-based Quake2-style browser FPS built with Three.js and Web Audio API  
**Snapshot Date:** 2026-05-23 (weapon system refactor update)  

---

## 🏗️ Architecture Overview

### Core Structure
```
/workspace/Quak/
├── index.html                 # Main entry point
├── README.md                  # Project documentation
├── AGENTS.md                  # Project state snapshot and agent instructions
├── test_load.html             # Manual loading test page
├── test_three.html            # Three.js sanity test page
├── css/
│   └── style.css              # Application styles
├── js/
│   ├── core/
│   │   ├── GameEngine.js              # Main game loop & orchestration (505 LOC)
│   │   ├── GameEngine_weapon_update.js# Weapon update integration helper (67 LOC)
│   │   ├── InputManager.js            # Player input handling (99 LOC)
│   │   ├── AudioSystem.js             # Web Audio API integration (162 LOC)
│   │   └── Debug.js                   # Centralized debug/logging system (308 LOC)
│   ├── renderer/
│   │   ├── Renderer.js        # Three.js rendering setup (29 LOC)
│   │   └── PostProcessing.js  # Visual effects scaffold (29 LOC)
│   ├── entities/
│   │   ├── Player.js          # Player entity logic (135 LOC)
│   │   ├── Enemy.js           # Enemy AI & behavior (197 LOC)
│   │   └── weapons/
│   │       ├── Weapon.js         # Base weapon class and shared behavior (218 LOC)
│   │       ├── Pistol.js         # Pistol weapon implementation (109 LOC)
│   │       ├── Rifle.js          # Rifle weapon implementation (125 LOC)
│   │       ├── Shotgun.js        # Shotgun weapon implementation (138 LOC)
│   │       ├── RocketLauncher.js # Rocket launcher implementation (333 LOC)
│   │       └── index.js          # Weapon exports (5 LOC)
│   ├── world/
│   │   ├── Level.js           # Level loading & management (663 LOC)
│   │   ├── Collision.js       # Collision detection (71 LOC)
│   │   └── Props.js           # Environmental props (70 LOC)
│   ├── ui/
│   │   └── HUD.js             # Heads-up display (258 LOC)
│   └── libs/
│       └── three.min.js       # Local Three.js library stub/reference
└── assets/
    ├── maps/                  # Level maps (currently empty)
    ├── models/                # 3D models (currently empty)
    ├── sounds/                # Audio files (currently empty)
    └── textures/              # Texture files (currently empty)
```

### Code Statistics
- **Total JavaScript Lines:** ~3,527 LOC
- **Total Source JS Files:** 19 (excluding generated/build artifacts)
- **Additional Web Entry/Test Files:** `index.html`, `test_load.html`, `test_three.html`, `css/style.css`
- **Main Dependencies:** Three.js, Web Audio API
- **Asset Status:** Asset directories exist but are still placeholders (no production assets committed)

---

## 🎯 Current Development Stage

**Stage:** Expanded Prototype / Core Systems Integration

### Completed:
- ✅ Modular project structure with separated core/renderer/world/entities/ui layers
- ✅ Core game loop and orchestration (`GameEngine`)
- ✅ Input management and browser pointer-lock interactions
- ✅ Audio system foundation via Web Audio API
- ✅ Dedicated debug infrastructure (`Debug.js`) with categories and levels
- ✅ Enemy/player entity logic and HUD integration
- ✅ Expanded weapon framework with multiple concrete weapons and centralized base behavior
  - Pistol
  - Rifle
  - Shotgun
  - Rocket Launcher
- ✅ Unified weapon state model (`isMoving`, `isSprinting`, `isFiring`, `isReloading`, `reloadProgress`) for autonomous per-weapon animation/update logic
- ✅ Manual browser test pages (`test_load.html`, `test_three.html`) for integration sanity checks

### In Progress / Missing:
- ⚠️ Real game assets are still missing (maps/models/textures/sounds directories are empty)
- ⚠️ Asset loading pipeline and content validation are still incomplete
- ⚠️ Automated tests and CI checks are not configured
- ⚠️ Build/deployment pipeline is not defined (no bundling/minification workflow yet)

---

## 🔧 Key Components

### 1. GameEngine (`js/core/GameEngine.js`)
Central orchestrator managing:
- Game loop & frame timing
- Score, player state, and runtime system coordination
- Entity collections (enemies, projectiles, particles)
- Initialization sequence across subsystems

### 2. Weapon System (`js/entities/weapons/*`)
Modular weapon architecture handling:
- Shared base behavior in `Weapon.js`
- Per-weapon fire/reload/balance logic in dedicated classes
- Export aggregation via `js/entities/weapons/index.js`
- Ongoing integration support from `GameEngine_weapon_update.js`

### 3. Level System (`js/world/Level.js`)
Largest world module (663 LOC) handling:
- Level data parsing and setup
- Map geometry generation
- Enemy spawn points and objective flow
- Level completion logic

### 4. Renderer (`js/renderer/Renderer.js` + `PostProcessing.js`)
Three.js wrapper providing:
- Scene/camera/renderer setup
- WebGL render flow foundation
- Post-processing extension point

### 5. Debug System (`js/core/Debug.js` + integrations)
Central logging framework providing:
- **Global toggle** - `DEBUG.ENABLED`
- **Category toggles** - core/entity/combat/physics/world/ui/input/render/perf/audio
- **Log levels** - trace/log/info/warn/error
- **Performance diagnostics** - frame/FPS visibility
- **Structured error messaging** in critical game paths

Usage in browser console:
```javascript
DEBUG.ENABLED = false;                 // Disable all logs
DEBUG.CATEGORIES.combat = false;       // Disable combat logs only
DEBUG.LEVELS.error = true;             // Keep error-level logs visible
```

---

## ⚠️ IMPORTANT: File Update Policy

### 🔄 CRITICAL REQUIREMENT

**WHENEVER CODE CHANGES ARE MADE, THIS FILE MUST BE UPDATED IMMEDIATELY.**

This file is the source-of-truth project snapshot for architecture, stage, and current known gaps.

---

## 🚀 Next Steps

1. **Asset Integration** - Add real maps/models/textures/sounds
2. **Asset Pipeline** - Implement robust runtime loaders and fallback handling
3. **Gameplay Validation** - Run integration passes across weapons, AI, and level flow
4. **Automated Testing & CI** - Add smoke/unit checks and continuous verification
5. **Build Process** - Add production bundling/minification and deployment docs

---

## 📝 Notes for Agents

- Browser-based FPS project using Three.js + Web Audio API
- Game architecture is modular and already split by responsibility
- Asset directories are still placeholders, so full gameplay readiness is not yet achieved
- `GameEngine` is the primary runtime coordinator
- Weapon logic is now distributed under `js/entities/weapons/`
- Debug controls are first-class; tune verbosity with `DEBUG.ENABLED` and `DEBUG.CATEGORIES.*`
- Prefer incremental integration and sanity checks via `test_load.html` and `test_three.html`

---

*Last Updated: 2026-05-23 (UTC, ES module bridge for weapons in index.html)*  
*Maintained by: Development Team & AI Agents*
