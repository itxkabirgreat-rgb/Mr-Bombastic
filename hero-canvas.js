/**
 * PRIME ENERGY HYDRATION — HERO CANVAS ENGINE v4
 * Crystal-clear 2K rendering using physical pixel drawing (no setTransform).
 * Seamless infinite loop, COVER mode, imageSmoothingQuality = 'high'.
 */

class HeroBottleAnimation {
  constructor(options = {}) {
    this.canvas      = document.getElementById(options.canvasId || 'hero-canvas');
    this.heroSection = document.getElementById(options.heroId   || 'home');

    if (!this.canvas) { console.warn('Hero canvas not found.'); return; }

    this.ctx = this.canvas.getContext('2d', {
      alpha: true,
      willReadFrequently: false
    });

    this.totalFrames = 300;
    this.images      = new Array(this.totalFrames + 1);
    this.loadedCount = 0;

    // Playback state
    this.currentFrame  = 1;
    this.isPlaying     = true;
    this.isInView      = true;
    this.frameRate     = 30;                        // 30 fps — smooth & crisp
    this.frameInterval = 1000 / this.frameRate;
    this.lastFrameTime = 0;

    // Sound sync
    this.triggeredSoundFrames = new Set();

    this.init();
  }

  /* ---------------------------------------------------------------------- */
  getFramePath(i) {
    return `ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
  }

  /* ---------------------------------------------------------------------- */
  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Show frame 1 immediately
    const f1 = new Image();
    f1.src = this.getFramePath(1);
    this.images[1] = f1;
    f1.onload = () => { this.loadedCount++; this.drawFrame(1); };

    this.preloadAll();
    this.setupIntersection();

    // Kick off render loop
    requestAnimationFrame(ts => this.loop(ts));
  }

  /* ---------------------------------------------------------------------- */
  resize() {
    // Clamp DPR at 2 — gives 2K-class quality on all screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w   = window.innerWidth;
    const h   = window.innerHeight;

    // Physical pixel buffer (this is what the GPU sees)
    this.canvas.width  = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);

    // CSS display size stays at logical pixels — browser handles DPR mapping
    this.canvas.style.width  = w + 'px';
    this.canvas.style.height = h + 'px';

    this.dpr = dpr;

    // Re-apply smoothing after every resize (canvas resets its state)
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.drawFrame(this.currentFrame || 1);
  }

  /* ---------------------------------------------------------------------- */
  preloadAll() {
    // First-half priority — loads frames 1–150 first
    for (let i = 1; i <= 150; i++) this.loadOne(i);
    // Second half slightly delayed so first half isn't starved
    setTimeout(() => {
      for (let i = 151; i <= this.totalFrames; i++) this.loadOne(i);
    }, 600);
  }

  loadOne(i) {
    if (this.images[i]) return;
    const img = new Image();
    img.src = this.getFramePath(i);
    this.images[i] = img;
    img.onload = () => this.loadedCount++;
  }

  /* ---------------------------------------------------------------------- */
  setupIntersection() {
    if (!this.heroSection || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // Re-entered hero — restart from frame 1
          this.isInView      = true;
          this.isPlaying     = true;
          this.currentFrame  = 1;
          this.lastFrameTime = performance.now();
          this.triggeredSoundFrames.clear();
        } else {
          // Left hero — pause to save CPU
          this.isInView  = false;
          this.isPlaying = false;
        }
      });
    }, { threshold: 0.1 });
    obs.observe(this.heroSection);
  }

  /* ---------------------------------------------------------------------- */
  checkSound(frame) {
    const s = window.soundEngine;
    if (!s) return;
    const fire = (f, fn) => {
      if (frame >= f && !this.triggeredSoundFrames.has(f)) {
        this.triggeredSoundFrames.add(f);
        fn();
      }
    };
    fire(  5, ()  => s.playThunderStorm());
    fire( 45, ()  => s.playLightningZap(1.0));
    fire( 75, ()  => s.playLightningZap(1.3));
    fire(100, ()  => s.playWaterShockwave());
    fire(155, ()  => s.playBottlePopUp());
    fire(250, ()  => s.playHeroReveal());
  }

  /* ---------------------------------------------------------------------- */
  drawFrame(frameIndex) {
    if (!this.ctx) return;

    const target = Math.max(1, Math.min(this.totalFrames, Math.round(frameIndex)));
    this.checkSound(target);

    // Find nearest loaded frame
    let img = this.images[target];
    if (!img?.complete || !img.naturalWidth) {
      for (let off = 1; off < 80; off++) {
        const p = target - off;
        const n = target + off;
        if (p >= 1 && this.images[p]?.complete && this.images[p].naturalWidth) { img = this.images[p]; break; }
        if (n <= this.totalFrames && this.images[n]?.complete && this.images[n].naturalWidth) { img = this.images[n]; break; }
      }
    }
    if (!img?.complete || !img.naturalWidth) return;

    // ---- Draw in PHYSICAL PIXELS (canvas.width / canvas.height) ----
    const cw = this.canvas.width;   // e.g. 2560 on 2K monitor
    const ch = this.canvas.height;  // e.g. 1440
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // COVER: fill canvas completely, centre the image, crop edges as needed
    const ca = cw / ch;
    const ia = iw / ih;
    let dw, dh, dx, dy;
    if (ca > ia) {          // canvas wider than frame → fit width
      dw = cw;
      dh = cw / ia;
      dx = 0;
      dy = (ch - dh) / 2;
    } else {                // canvas taller than frame → fit height
      dh = ch;
      dw = ch * ia;
      dx = (cw - dw) / 2;
      dy = 0;
    }

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ---------------------------------------------------------------------- */
  loop(ts) {
    if (this.isPlaying && this.isInView) {
      if (!this.lastFrameTime) this.lastFrameTime = ts;
      const delta = ts - this.lastFrameTime;

      if (delta >= this.frameInterval) {
        this.lastFrameTime = ts - (delta % this.frameInterval);

        // Advance, wrap seamlessly — NO hold, NO stop
        this.currentFrame = this.currentFrame >= this.totalFrames ? 1 : this.currentFrame + 1;

        // Reset sounds at beginning of each cycle
        if (this.currentFrame === 1) this.triggeredSoundFrames.clear();

        this.drawFrame(this.currentFrame);
      }
    }
    requestAnimationFrame(ts => this.loop(ts));
  }
}

window.HeroBottleAnimation = HeroBottleAnimation;
