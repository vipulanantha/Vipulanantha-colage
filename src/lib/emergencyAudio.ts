/**
 * Web Audio Emergency Alarm & Siren Synthesizer
 * Generates clear, high-priority emergency sirens and acoustic warning bursts
 * using Web Audio API without relying on external mp3 assets.
 */

let audioCtx: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenModulator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let isSirenPlaying = false;
let currentVolume = 0.8;
let soundEnabled = true;

/**
 * Initialize or resume AudioContext after user gesture
 */
export const initAudioContext = (): AudioContext | null => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {
        // user gesture required
      });
    }
    return audioCtx;
  } catch (err) {
    console.warn('AudioContext not supported or permission denied', err);
    return null;
  }
};

/**
 * Start playing emergency acoustic alarm siren
 */
export const startEmergencySiren = (volume = 0.8): boolean => {
  if (!soundEnabled || isSirenPlaying) return false;

  const ctx = initAudioContext();
  if (!ctx) return false;

  try {
    stopEmergencySiren(); // ensure any previous sound is stopped

    const now = ctx.currentTime;
    sirenGain = ctx.createGain();
    sirenGain.gain.setValueAtTime(0.01, now);
    sirenGain.gain.linearRampToValueAtTime(volume * currentVolume, now + 0.15);
    sirenGain.connect(ctx.destination);

    // Main carrier oscillator (oscillating between 800Hz and 1400Hz)
    sirenOscillator = ctx.createOscillator();
    sirenOscillator.type = 'sawtooth';
    sirenOscillator.frequency.setValueAtTime(950, now);

    // Modulation oscillator for realistic siren sweep (2 Hz sweep cycle)
    sirenModulator = ctx.createOscillator();
    sirenModulator.type = 'sine';
    sirenModulator.frequency.setValueAtTime(2.2, now); // 2.2 cycles per second

    const modulationGain = ctx.createGain();
    modulationGain.gain.setValueAtTime(350, now); // frequency deviation +/- 350Hz

    sirenModulator.connect(modulationGain);
    modulationGain.connect(sirenOscillator.frequency);

    sirenOscillator.connect(sirenGain);

    sirenModulator.start(now);
    sirenOscillator.start(now);

    isSirenPlaying = true;

    // Trigger device vibration if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }

    return true;
  } catch (err) {
    console.warn('Could not start emergency siren sound:', err);
    return false;
  }
};

/**
 * Stop active emergency siren
 */
export const stopEmergencySiren = (): void => {
  if (!isSirenPlaying && !sirenOscillator) return;

  try {
    if (sirenGain && audioCtx) {
      const now = audioCtx.currentTime;
      sirenGain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      setTimeout(() => {
        try {
          if (sirenOscillator) {
            sirenOscillator.stop();
            sirenOscillator.disconnect();
          }
          if (sirenModulator) {
            sirenModulator.stop();
            sirenModulator.disconnect();
          }
        } catch {
          // ignore already stopped
        }
        sirenOscillator = null;
        sirenModulator = null;
        sirenGain = null;
        isSirenPlaying = false;
      }, 120);
    } else {
      if (sirenOscillator) sirenOscillator.stop();
      if (sirenModulator) sirenModulator.stop();
      sirenOscillator = null;
      sirenModulator = null;
      sirenGain = null;
      isSirenPlaying = false;
    }
  } catch {
    isSirenPlaying = false;
  }
};

/**
 * Play a single urgent notification beep for medium/high alerts
 */
export const playUrgentAlertChime = (): void => {
  if (!soundEnabled) return;
  const ctx = initAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.1); // D6
    osc.frequency.setValueAtTime(1760, now + 0.2); // A6

    gain.gain.setValueAtTime(0.2 * currentVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch (err) {
    console.warn('Could not play alert chime:', err);
  }
};

/**
 * Play a test emergency sound (2 seconds)
 */
export const playTestSiren = (durationSeconds = 2): void => {
  startEmergencySiren(currentVolume);
  setTimeout(() => {
    stopEmergencySiren();
  }, durationSeconds * 1000);
};

export const setSirenVolume = (volume: number): void => {
  currentVolume = Math.max(0, Math.min(1, volume));
  if (sirenGain && audioCtx && isSirenPlaying) {
    sirenGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
  }
};

export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
  if (!enabled && isSirenPlaying) {
    stopEmergencySiren();
  }
};

export const getIsSirenPlaying = (): boolean => isSirenPlaying;
