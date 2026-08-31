/**
 * PRIME ENERGY HYDRATION — CINEMATIC AUDIO ENGINE v3
 *
 * Realistic, dramatic sounds synchronized with the bottle animation:
 *
 *  Frame   5 → Deep rolling thunder rumble (storm buildup)
 *  Frame  45 → Sharp electric lightning CRACK
 *  Frame  75 → Second lightning crack (louder)
 *  Frame 100 → Heavy water impact / hydraulic shockwave
 *  Frame 155 → POWERFUL bottle emergence BOOM + cinematic riser
 *  Frame 250 → Epic reveal impact + orchestral chord sting
 */

class SoundEngine {
  constructor() {
    this.ctx       = null;
    this.master    = null;
    this.isEnabled = true;
    this.unlocked  = false;

    this._init();
    this._gestureUnlock();
    this._setupUI();
  }

  /* -----------------------------------------------------------------------
     Audio context bootstrap
  ----------------------------------------------------------------------- */
  _init() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx    = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.master.connect(this.ctx.destination);
    } catch (e) { console.warn('WebAudio not supported', e); }
  }

  _resume() {
    if (!this.ctx) this._init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().then(() => { this.unlocked = true; this._updateUI(); });
    } else if (this.ctx?.state === 'running') {
      this.unlocked = true;
      this._updateUI();
    }
  }

  _gestureUnlock() {
    const h = () => this._resume();
    ['click','touchstart','mousedown','keydown','scroll']
      .forEach(e => window.addEventListener(e, h, { passive: true }));
  }

  _setupUI() {
    const toggle   = document.getElementById('audio-toggle');
    const floatBtn = document.getElementById('floating-sound-prompt');

    toggle?.addEventListener('click', e => {
      e.stopPropagation();
      this._resume();
      this.isEnabled = !this.isEnabled;
      this._updateUI();
      if (this.isEnabled) this._crack(1.0); // feedback click
    });

    floatBtn?.addEventListener('click', e => {
      e.stopPropagation();
      this._resume();
      this.isEnabled = true;
      this._updateUI();
      this._crack(1.0);
      floatBtn.style.display = 'none';
    });
  }

  _updateUI() {
    const bars     = document.getElementById('audio-bars');
    const toggle   = document.getElementById('audio-toggle');
    const floatBtn = document.getElementById('floating-sound-prompt');
    const active   = this.isEnabled && this.unlocked;

    if (bars)   active ? bars.classList.add('active') : bars.classList.remove('active');
    if (toggle) toggle.setAttribute('aria-label', active ? 'Sound On' : 'Sound Off');
    if (floatBtn && active) floatBtn.style.display = 'none';
  }

  _canPlay() {
    return this.isEnabled && this.ctx?.state === 'running';
  }

  /* -----------------------------------------------------------------------
     Core synthesis utilities
  ----------------------------------------------------------------------- */

  /** Noise buffer of given duration */
  _noiseBuffer(dur) {
    const len = Math.ceil(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Play filtered noise: attackMs, decayMs, cutoff Hz, gain */
  _noise(attackS, decayS, cutoffHz, gainPeak, bpQ = 0, startOffset = 0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + startOffset;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer(attackS + decayS + 0.1);

    const filt = this.ctx.createBiquadFilter();
    filt.type  = bpQ > 0 ? 'bandpass' : 'lowpass';
    filt.frequency.setValueAtTime(cutoffHz, now);
    if (bpQ > 0) filt.Q.value = bpQ;

    const env  = this.ctx.createGain();
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(gainPeak, now + attackS);
    env.gain.exponentialRampToValueAtTime(0.001, now + attackS + decayS);

    src.connect(filt); filt.connect(env); env.connect(this.master);
    src.start(now);
    src.stop(now + attackS + decayS + 0.05);
  }

  /** Simple oscillator tone */
  _tone(type, freqStart, freqEnd, durS, gainPeak, startOffset = 0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + startOffset;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart)
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + durS);
    env.gain.setValueAtTime(gainPeak, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + durS);
    osc.connect(env); env.connect(this.master);
    osc.start(now); osc.stop(now + durS + 0.02);
  }

  /* -----------------------------------------------------------------------
     FRAME 5 — Rolling Thunder Rumble (storm build-up)
     Realistic thunder: deep broadband noise at 20–120 Hz,
     slow attack, 4-second rolling decay.
  ----------------------------------------------------------------------- */
  playThunderStorm() {
    if (!this._canPlay()) return;

    // Layer 1: Sub-bass rumble (25–80 Hz) — the "chest feel" of thunder
    this._noise(0.15, 3.8, 55, 0.55);

    // Layer 2: Mid-low rumble body (100–250 Hz) — adds realism texture
    this._noise(0.08, 2.5, 160, 0.25);

    // Layer 3: Distant high crack — the initial strike transient
    this._noise(0.01, 0.35, 3000, 0.3, 5);

    // Layer 4: Rolling echo decay (50–90 Hz low-pass), starts slightly after
    this._noise(0.4, 3.0, 70, 0.18, 0, 0.3);
  }

  /* -----------------------------------------------------------------------
     FRAME 45 / 75 — Electric Lightning Crack
     Realistic crack: instantaneous broadband burst + short low-freq thud.
  ----------------------------------------------------------------------- */
  playLightningZap(intensity = 1.0) {
    if (!this._canPlay()) return;

    // Sharp initial crack (wideband — no frequency sweep, just a CRACK)
    this._noise(0.002, 0.08 * intensity, 8000, 0.7 * intensity, 8);

    // Low-thud accompanying the crack
    this._noise(0.005, 0.18 * intensity, 120, 0.4 * intensity);

    // Brief after-crackle (lighter noise tail)
    this._noise(0.01, 0.25, 2500, 0.15 * intensity, 4, 0.06);
  }

  // internal — used as sound toggle click feedback
  _crack(vol = 1.0) { this.playLightningZap(vol * 0.5); }

  /* -----------------------------------------------------------------------
     FRAME 100 — Water Impact & Hydraulic Shockwave
     Deep thump + splashing noise.
  ----------------------------------------------------------------------- */
  playWaterShockwave() {
    if (!this._canPlay()) return;

    // Deep impact thump (sub kick-style)
    this._tone('sine', 120, 25, 0.55, 0.6);

    // Water spray noise (bandpass 300–1200 Hz, splashy)
    this._noise(0.03, 0.55, 600, 0.35, 2);

    // High-freq mist spray tail
    this._noise(0.02, 0.4, 3500, 0.12, 3, 0.05);
  }

  /* -----------------------------------------------------------------------
     FRAME 155 — POWERFUL Bottle Emergence BOOM
     Dramatic low-end impact + epic cinematic riser whoosh.
  ----------------------------------------------------------------------- */
  playBottlePopUp() {
    if (!this._canPlay()) return;

    // === LAYER 1: Massive sub-bass IMPACT BOOM ===
    // Like a heavy kick drum — punchy and powerful
    this._tone('sine', 160, 22, 0.6, 0.85);

    // === LAYER 2: Distorted mid-body crunch ===
    this._tone('sawtooth', 90, 35, 0.4, 0.3);

    // === LAYER 3: Impact noise burst (broadband thud) ===
    this._noise(0.005, 0.3, 800, 0.5);

    // === LAYER 4: Cinematic RISER (upward sweep 80 → 2000 Hz) ===
    // Starts 0.1s after impact, sweeps upward for drama
    const now = this.ctx.currentTime + 0.1;
    const riser = this.ctx.createOscillator();
    const riserEnv = this.ctx.createGain();
    const riserFilter = this.ctx.createBiquadFilter();
    riser.type = 'sawtooth';
    riser.frequency.setValueAtTime(80, now);
    riser.frequency.exponentialRampToValueAtTime(2200, now + 1.2);
    riserFilter.type = 'bandpass';
    riserFilter.frequency.setValueAtTime(200, now);
    riserFilter.frequency.exponentialRampToValueAtTime(2000, now + 1.2);
    riserFilter.Q.value = 3;
    riserEnv.gain.setValueAtTime(0.001, now);
    riserEnv.gain.linearRampToValueAtTime(0.28, now + 0.6);
    riserEnv.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    riser.connect(riserFilter);
    riserFilter.connect(riserEnv);
    riserEnv.connect(this.master);
    riser.start(now); riser.stop(now + 1.25);

    // === LAYER 5: High-energy noise swell ===
    this._noise(0.05, 1.0, 4500, 0.2, 3, 0.12);
  }

  /* -----------------------------------------------------------------------
     FRAME 250 — Full Hero Reveal — Epic Impact + Orchestral Sting
  ----------------------------------------------------------------------- */
  playHeroReveal() {
    if (!this._canPlay()) return;

    // Sub-bass drop
    this._tone('sine', 80, 20, 1.8, 0.7);

    // Orchestral impact chord — Eb minor (power & tension)
    const chordFreqs = [
      311.13,  // Eb4
      369.99,  // F#4 (Gb4)
      466.16,  // Bb4
      622.25,  // Eb5
      739.99   // F#5
    ];
    chordFreqs.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.025;
      const o   = this.ctx.createOscillator();
      const g   = this.ctx.createGain();
      o.type    = 'triangle';
      o.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      o.connect(g); g.connect(this.master);
      o.start(now); o.stop(now + 1.65);
    });

    // High shimmer sparkle noise
    this._noise(0.01, 0.9, 6000, 0.18, 5);
  }

  /* -----------------------------------------------------------------------
     UI Sound Effects (cart, clicks, etc.)
  ----------------------------------------------------------------------- */
  playClick() {
    if (!this._canPlay()) return;
    this._tone('sine', 900, 350, 0.05, 0.08);
  }

  playSurge() {
    if (!this._canPlay()) return;
    this._tone('sawtooth', 140, 480, 0.18, 0.1);
    setTimeout(() => this._tone('sawtooth', 480, 100, 0.2, 0.07), 150);
  }

  playCartAdd() {
    if (!this._canPlay()) return;
    [523.25, 659.25, 1046.50].forEach((f, i) => {
      this._tone('triangle', f, f, 0.18, 0.12, i * 0.08);
    });
  }
}

window.soundEngine = new SoundEngine();
window.soundFX     = window.soundEngine;
