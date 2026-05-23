class Props {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.particles = game.particles;
  }

  spawnParticles(pos, color, count) {
    DEBUG.world.trace('spawnParticles', { pos, color: '#' + color.toString(16), count });
    
    for (let i = 0; i < count; i++) {
      const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      this.scene.add(mesh);

      this.particles.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          Math.random() * 5,
          (Math.random() - 0.5) * 5
        ),
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        mesh
      });
    }
    DEBUG.world.log(`Создано ${count} частиц`);
  }

  updateParticles(dt) {
    DEBUG.world.trace('updateParticles', { count: this.particles.length });
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.velocity.y -= 9.8 * dt;
      p.position.add(p.velocity.clone().multiplyScalar(dt));

      if (p.mesh) {
        p.mesh.position.copy(p.position);
        p.mesh.material.opacity = p.life / p.maxLife;
      }

      if (p.life <= 0) {
        if (p.mesh) this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
    
    DEBUG.world.trace('updateParticles end', { remaining: this.particles.length });
  }

  spawnTracer(from, dir, dist, color) {
    DEBUG.combat.trace('spawnTracer', { from, dir, dist, color: '#' + color.toString(16) });
    
    const to = from.clone().add(dir.clone().multiplyScalar(dist));
    const points = [from, to];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    setTimeout(() => {
      this.scene.remove(line);
      DEBUG.combat.trace('Tracer удален');
    }, 80);
  }
}
