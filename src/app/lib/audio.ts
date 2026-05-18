// Audio engine for tactical sound effects
// Uses Web Audio API — no external dependencies

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  delay = 0
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch {
    // Silently fail if audio is blocked
  }
}

export const Audio = {
  /** Played when scan starts */
  scanStart() {
    playTone(440, 0.1, "square", 0.08);
    playTone(880, 0.1, "square", 0.08, 0.1);
    playTone(660, 0.15, "square", 0.06, 0.2);
  },

  /** Tick sound during scanning */
  scanTick() {
    playTone(220, 0.04, "square", 0.04);
  },

  /** Complete chime — friendly */
  scanComplete() {
    playTone(523, 0.12, "sine", 0.12);
    playTone(659, 0.12, "sine", 0.12, 0.13);
    playTone(784, 0.25, "sine", 0.12, 0.26);
  },

  /** Alert for HIGH/CRITICAL threat */
  threatAlert() {
    for (let i = 0; i < 3; i++) {
      playTone(880, 0.1, "square", 0.15, i * 0.25);
      playTone(440, 0.1, "square", 0.08, i * 0.25 + 0.12);
    }
  },

  /** Error beep */
  error() {
    playTone(200, 0.3, "sawtooth", 0.1);
    playTone(150, 0.3, "sawtooth", 0.1, 0.32);
  },

  /** Button click */
  click() {
    playTone(660, 0.04, "square", 0.05);
  },

  /** Upload accepted */
  upload() {
    playTone(330, 0.06, "square", 0.07);
    playTone(440, 0.08, "square", 0.07, 0.07);
  },
};
