class PostProcessing {
  constructor() {
    // CSS-based post-processing effects are already in style.css:
    // #scanlines — repeating linear gradient overlay
    // #vignette — radial gradient darkening at edges
    // #damage-flash — red radial flash on damage
    // #muzzle-flash — yellow radial flash on fire
    // These are toggled via opacity in GameEngine
  }

  flashDamage() {
    const el = document.getElementById('damage-flash');
    el.style.opacity = 0.6;
    setTimeout(() => el.style.opacity = 0, 200);
  }

  flashMuzzle() {
    const el = document.getElementById('muzzle-flash');
    el.style.opacity = 1;
    setTimeout(() => el.style.opacity = 0, 50);
  }

  showMessage(text) {
    const el = document.getElementById('level-msg');
    el.textContent = text;
    el.style.opacity = 1;
    setTimeout(() => el.style.opacity = 0, 3000);
  }
}
