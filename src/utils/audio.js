// Web Audio API sound effects synthesizer — zero external audio files needed!
class SoundManager {
  constructor() {
    this.ctx = null
    this.muted = false
    this._listeners = []
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.ctx = new AudioContext()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  get isMuted() {
    return this.muted
  }

  toggleMute() {
    this.muted = !this.muted
    this._listeners.forEach((fn) => fn(this.muted))
    return this.muted
  }

  onMuteChange(fn) {
    this._listeners.push(fn)
    return () => {
      this._listeners = this._listeners.filter((l) => l !== fn)
    }
  }

  playThrow() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(360, now)
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1)
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.1)
    } catch {}
  }

  playHit(perfect = false) {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(perfect ? 340 : 180, now)
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.14)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.14)
    } catch {}
  }

  playCollision() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(650, now)
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.22)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.22)
    } catch {}
  }

  playUnscrew() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      ;[0, 0.06, 0.12].forEach((t, i) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(460 + i * 90, now + t)
        gain.gain.setValueAtTime(0.2, now + t)
        gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.05)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now + t)
        osc.stop(now + t + 0.05)
      })
    } catch {}
  }

  playBlocked() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(150, now)
      gain.gain.setValueAtTime(0.16, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.12)
    } catch {}
  }

  playLevelWin() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.09)
        gain.gain.setValueAtTime(0.22, now + idx * 0.09)
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.28)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now + idx * 0.09)
        osc.stop(now + idx * 0.09 + 0.28)
      })
    } catch {}
  }

  // Countdown tick (3, 2, 1)
  playCountdownTick() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.08)
    } catch {}
  }

  // Countdown GO!
  playCountdownGo() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      ;[440, 660, 880].forEach((freq, i) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + i * 0.06)
        gain.gain.setValueAtTime(0.2, now + i * 0.06)
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.15)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now + i * 0.06)
        osc.stop(now + i * 0.06 + 0.15)
      })
    } catch {}
  }

  // New high score fanfare
  playNewBest() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.1)
        gain.gain.setValueAtTime(0.18, now + idx * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.35)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now + idx * 0.1)
        osc.stop(now + idx * 0.1 + 0.35)
      })
    } catch {}
  }

  // UI click feedback
  playClick() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, now)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.04)
    } catch {}
  }

  // Bullseye chime
  playBullseye() {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      ;[880, 1174.66, 1760].forEach((freq, i) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.05)
        gain.gain.setValueAtTime(0.22, now + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now + i * 0.05)
        osc.stop(now + i * 0.05 + 0.2)
      })
    } catch {}
  }

  // Combo multiplier chime
  playCombo(level = 1) {
    this.init()
    if (!this.ctx || this.muted) return
    try {
      const now = this.ctx.currentTime
      const baseFreq = 520 + Math.min(8, level) * 80
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(baseFreq, now)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12)
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.12)
    } catch {}
  }
}

export const sound = new SoundManager()
