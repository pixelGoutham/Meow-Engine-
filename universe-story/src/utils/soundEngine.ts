// src/utils/soundEngine.ts
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx({ latencyHint: 'interactive' });
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.14; // Faint classroom-safe ambient level
    this.masterGain.connect(this.ctx.destination);
    this.startAmbientDrone();
  }

  private startAmbientDrone() {
    if (!this.ctx || !this.masterGain || this.isPlaying) return;
    this.isPlaying = true;

    // Warm cosmic chord (C2, G2, D3, E3)
    const freqs = [65.41, 98.0, 146.83, 164.81];
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const oscGain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;

      filter.type = 'lowpass';
      filter.frequency.value = 260;

      oscGain.gain.value = 0.18 / freqs.length;

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start();
    });
  }

  public playClick() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playSingularity() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // 1. Sub-bass implosion riser (0s -> 1.8s)
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(45, now);
    sub.frequency.exponentialRampToValueAtTime(160, now + 1.8);

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.5, now + 1.75);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.9);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 3.0);

    // 2. High-frequency crystalline ping at singularity detonation (1.85s)
    const ping = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(1760, now + 1.85);
    ping.frequency.exponentialRampToValueAtTime(880, now + 3.2);

    pingGain.gain.setValueAtTime(0.0001, now);
    pingGain.gain.setValueAtTime(0.45, now + 1.85);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    ping.connect(pingGain);
    pingGain.connect(this.masterGain);
    ping.start(now);
    ping.stop(now + 3.3);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.14, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }
}

export const soundEngine = new SoundEngine();