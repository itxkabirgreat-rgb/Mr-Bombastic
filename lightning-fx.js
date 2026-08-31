/**
 * PRIME ENERGY HYDRATION - ATMOSPHERIC LIGHTNING & PARTICLE CANVAS
 * Procedural electric purple lightning bursts, energy particle field,
 * volumetric purple glow pulses, and atmospheric fog simulation.
 */

class LightningAtmosphere {
  constructor(canvasId = 'lightning-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.lightningBolts = [];
    this.particleCount = window.innerWidth < 768 ? 35 : 75;
    this.lastLightningTime = Date.now();
    this.lightningInterval = 4000; // Average ms between ambient strikes
    this.isLightningActive = false;
    this.lightningFlashIntensity = 0;
    
    // Mouse interactive coordinates
    this.mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      isActive: false
    };

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.isActive = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.isActive = false;
    });

    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 1.2 - 0.3, // Floats upward like energy embers
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.3 ? '#c084fc' : (Math.random() > 0.5 ? '#e879f9' : '#38bdf8')
      });
    }
  }

  createLightningBolt(startX, startY, endX, endY, branches = 2) {
    const segments = [];
    const dist = Math.hypot(endX - startX, endY - startY);
    const steps = Math.floor(dist / 22);

    let currX = startX;
    let currY = startY;

    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      const targetX = startX + (endX - startX) * progress;
      const targetY = startY + (endY - startY) * progress;

      // Random jitter perpendicular to line
      const jitter = (Math.random() - 0.5) * 45;
      const nextX = targetX + jitter;
      const nextY = targetY + (Math.random() - 0.5) * 15;

      segments.push({ x1: currX, y1: currY, x2: nextX, y2: nextY });
      currX = nextX;
      currY = nextY;

      // Create branch occasionally
      if (branches > 0 && Math.random() < 0.25 && i > 3 && i < steps - 3) {
        const branchEndX = currX + (Math.random() - 0.5) * 180;
        const branchEndY = currY + Math.random() * 140 + 40;
        this.createLightningBolt(currX, currY, branchEndX, branchEndY, branches - 1);
      }
    }

    segments.push({ x1: currX, y1: currY, x2: endX, y2: endY });

    this.lightningBolts.push({
      segments,
      alpha: 1.0,
      decay: Math.random() * 0.08 + 0.06,
      width: Math.random() * 2.5 + 1.5
    });
  }

  triggerRandomStrike() {
    const startX = Math.random() * this.width * 0.8 + this.width * 0.1;
    const startY = -20;
    const endX = startX + (Math.random() - 0.5) * 200;
    const endY = this.height * (Math.random() * 0.4 + 0.5);

    this.createLightningBolt(startX, startY, endX, endY, 2);
    this.lightningFlashIntensity = 0.35; // Screen flash
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw atmospheric flash overlay
    if (this.lightningFlashIntensity > 0.01) {
      this.ctx.fillStyle = `rgba(168, 85, 247, ${this.lightningFlashIntensity * 0.2})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.lightningFlashIntensity *= 0.88;
    }

    // 2. Ambient Volumetric Glow in Center/Bottom
    const gradient = this.ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.65, 50,
      this.width * 0.5, this.height * 0.65, this.width * 0.55
    );
    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.14)');
    gradient.addColorStop(0.5, 'rgba(107, 33, 168, 0.06)');
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 3. Update & Draw Energy Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y += p.vy;
      p.x += p.vx;
      p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.01;

      // Mouse subtle gravity repulsion
      if (this.mouse.isActive) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        }
      }

      // Reset when particle goes off top or side
      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      // Draw particle glow
      this.ctx.save();
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha));
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 4. Update & Draw Lightning Bolts
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const bolt = this.lightningBolts[i];
      bolt.alpha -= bolt.decay;

      if (bolt.alpha <= 0) {
        this.lightningBolts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.strokeStyle = `rgba(232, 121, 249, ${bolt.alpha})`;
      this.ctx.lineWidth = bolt.width;
      this.ctx.shadowBlur = 25;
      this.ctx.shadowColor = '#c084fc';
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.ctx.beginPath();
      for (const seg of bolt.segments) {
        this.ctx.moveTo(seg.x1, seg.y1);
        this.ctx.lineTo(seg.x2, seg.y2);
      }
      this.ctx.stroke();

      // Core white-hot inner trace
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha * 0.9})`;
      this.ctx.lineWidth = Math.max(1, bolt.width * 0.4);
      this.ctx.stroke();

      this.ctx.restore();
    }

    // 5. Periodic lightning strike check
    const now = Date.now();
    if (now - this.lastLightningTime > this.lightningInterval) {
      if (Math.random() < 0.45) {
        this.triggerRandomStrike();
      }
      this.lastLightningTime = now;
      this.lightningInterval = 2500 + Math.random() * 4000;
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.LightningAtmosphere = LightningAtmosphere;
