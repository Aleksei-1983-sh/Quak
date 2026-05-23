# AGENTS.md - Project State & Guidelines

## 📊 Project Snapshot (Current State)

**Project Name:** Quake2 Browser  
**Description:** Web-based Quake2 game browser built with Three.js and Web Audio API  
**Snapshot Date:** Generated automatically  

---

## 🏗️ Architecture Overview

### Core Structure
```
/workspace/
├── index.html              # Main entry point
├── README.md               # Project documentation
├── css/
│   └── style.css           # Application styles
├── js/
│   ├── core/
│   │   ├── GameEngine.js   # Main game loop & orchestration (517 LOC)
│   │   ├── InputManager.js # Player input handling (72 LOC)
│   │   └── AudioSystem.js  # Web Audio API integration (162 LOC)
│   ├── renderer/
│   │   ├── Renderer.js     # Three.js rendering setup (29 LOC)
│   │   └── PostProcessing.js # Visual effects (29 LOC)
│   ├── entities/
│   │   ├── Player.js       # Player entity logic (116 LOC)
│   │   ├── Enemy.js        # Enemy AI & behavior (174 LOC)
│   │   └── Weapon.js       # Weapon system (9 LOC)
│   ├── world/
│   │   ├── Level.js        # Level loading & management (662 LOC)
│   │   ├── Collision.js    # Collision detection (45 LOC)
│   │   └── Props.js        # Environmental props (58 LOC)
│   └── ui/
│       └── HUD.js          # Heads-up display (178 LOC)
└── assets/
    ├── maps/               # Level maps (empty - needs assets)
    ├── models/             # 3D models (empty - needs assets)
    ├── sounds/             # Audio files (empty - needs assets)
    └── textures/           # Texture files (empty - needs assets)
```

### Code Statistics
- **Total JavaScript Lines:** ~2,051 LOC
- **Total Files:** 12 JS files + 1 HTML + 1 CSS
- **Main Dependencies:** Three.js, Web Audio API
- **Asset Status:** Placeholder directories only (no actual assets yet)

---

## 🎯 Current Development Stage

**Stage:** Early Development / Prototype

### Completed:
- ✅ Basic project structure established
- ✅ Core game engine architecture implemented
- ✅ Input management system
- ✅ Audio system foundation
- ✅ Entity classes (Player, Enemy, Weapon)
- ✅ World systems (Level, Collision, Props)
- ✅ UI/HUD system
- ✅ Renderer with post-processing support
- ✅ **Debug & Error System** - Comprehensive logging framework with categories and levels

### In Progress / Missing:
- ⚠️ No game assets loaded (textures, models, sounds, maps)
- ⚠️ Asset pipeline not configured
- ⚠️ Integration testing needed
- ⚠️ Build/deployment process not defined

---

## 🔧 Key Components

### 1. GameEngine (`js/core/GameEngine.js`)
Central orchestrator managing:
- Game loop & delta time
- Score & weapon state
- Entity collections (enemies, projectiles, particles)
- System initialization coordination

### 2. Level System (`js/world/Level.js`)
Largest module (662 LOC) handling:
- Level data parsing
- Map geometry generation
- Enemy spawn points
- Level completion logic

### 3. Renderer (`js/renderer/Renderer.js`)
Three.js wrapper providing:
- Scene setup
- Camera management
- WebGL renderer configuration

### 4. InputManager (`js/core/InputManager.js`)
Handles:
- Keyboard input
- Mouse movement/locking
- Action mappings

### 5. Debug System (Integrated across all modules)
Comprehensive logging framework providing:
- **Global toggle** - Enable/disable all logs via `DEBUG.ENABLED`
- **Categorized logging** - Separate controls for core, entity, combat, physics, world, ui, input, render, perf, audio
- **Log levels** - trace, log, info, warn, error with color coding
- **Timestamps** - Every log includes timing information
- **Contextual messages** - Detailed state information at critical points
- **Performance tracking** - FPS monitoring and frame time analysis
- **Error catching** - Try-catch blocks with informative error messages

Usage in browser console:
```javascript
DEBUG.ENABLED = false;  // Disable all logs
DEBUG.CATEGORIES.combat = false;  // Disable combat logs only
DEBUG.LEVELS.error = true;  // Show only errors
```

---

## ⚠️ IMPORTANT: File Update Policy

### 🔄 CRITICAL REQUIREMENT

**WHENEVER CODE CHANGES ARE MADE, THIS FILE MUST BE UPDATED IMMEDIATELY.**

#### Why?
This file serves as the single source of truth for:
- Project architecture understanding
- Current development stage
- Component relationships
- Code statistics and metrics
- Known gaps and TODOs

#### What to Update:
1. **Code Statistics** - Update LOC counts if files grow/shrink significantly
2. **File Structure** - Add/remove files in the architecture tree
3. **Development Stage** - Mark completed features, add new missing items
4. **Component Descriptions** - Update if component responsibilities change
5. **Snapshot Date** - Always update when making changes

#### How to Update:
- Edit the relevant sections above
- Keep descriptions concise but accurate
- Maintain the markdown structure
- Update the snapshot date to current date

**FAILURE TO UPDATE THIS FILE MAY RESULT IN OUTDATED ARCHITECTURE UNDERSTANDING AND INCORRECT ASSUMPTIONS ABOUT THE CODEBASE.**

---

## 🚀 Next Steps

1. **Asset Integration** - Add actual game assets to empty directories
2. **Asset Loading Pipeline** - Implement loaders for textures, models, sounds
3. **Testing** - Create test levels and verify gameplay mechanics
4. **Build Process** - Set up bundling/minification for production
5. **Documentation** - Expand README with usage instructions

---

## 📝 Notes for Agents

- This is a browser-based FPS using Three.js
- The codebase is modular with clear separation of concerns
- Asset directories are placeholders - the game cannot run without actual assets
- GameEngine is the central coordination point
- When adding features, follow existing patterns in the codebase
- Always verify asset paths and loading mechanisms when modifying world/entity code
- **Debug system is active** - Use `DEBUG.ENABLED` to control logging verbosity
- **Log categories** - Target specific systems: `DEBUG.CATEGORIES.physics`, `DEBUG.CATEGORIES.combat`, etc.
- **Error handling** - All critical sections have try-catch blocks with informative messages
- **Performance monitoring** - FPS logs available via `DEBUG.CATEGORIES.perf`

---

*Last Updated: Current Session*  
*Maintained by: Development Team & AI Agents*
