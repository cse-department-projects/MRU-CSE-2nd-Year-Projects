/**
 * ResQNet Web Audio Utility
 * Provides synthesized audio alerts using the standard browser Web Audio API.
 * Zero external audio dependencies; gracefully handles audio restrictions and missing APIs.
 */

let sharedAudioContext: AudioContext | null = null;

/**
 * Returns a lazily initialized AudioContext singleton or null if unsupported.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new AudioContextClass();
    } catch (err) {
      console.warn('ResQNet Sound: Web Audio API initialization failed:', err);
      return null;
    }
  }

  return sharedAudioContext;
}

/**
 * Checks whether the browser supports Web Audio API.
 */
export function isAudioSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  );
}

/**
 * Plays a pleasant double-beep confirmation chime lasting approximately 1 second.
 * Used when a citizen's SOS emergency dispatch is confirmed by the backend.
 *
 * Tone structure:
 * - Beep 1: 880 Hz (A5), duration ~0.18s
 * - Pause: ~0.10s
 * - Beep 2: 1046.5 Hz (C6), duration ~0.65s with exponential decay
 * Total duration: ~0.95-1.0s.
 *
 * Safe to call: never throws or disrupts application flow if audio is blocked or unsupported.
 */
export async function playConfirmationBeep(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    // If context was suspended by autoplay policy, attempt to resume
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Autoplay policy prevented resuming without gesture
        return false;
      }
    }

    const now = ctx.currentTime;

    // --- First Beep (880 Hz / A5) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);

    // Smooth envelope to prevent audio clicking
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.20);

    osc1.onended = () => {
      try {
        osc1.disconnect();
        gain1.disconnect();
      } catch {
        // Node already disconnected
      }
    };

    // --- Second Beep (1046.5 Hz / C6 - Harmonious confirmation chime) ---
    const start2 = now + 0.28;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, start2);

    gain2.gain.setValueAtTime(0.0001, start2);
    gain2.gain.exponentialRampToValueAtTime(0.22, start2 + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.0001, start2 + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(start2);
    osc2.stop(start2 + 0.70);

    osc2.onended = () => {
      try {
        osc2.disconnect();
        gain2.disconnect();
      } catch {
        // Node already disconnected
      }
    };

    return true;
  } catch (err) {
    console.warn('ResQNet Sound: Confirmation beep could not be played:', err);
    return false;
  }
}

// --- Continuous Emergency Buzzer (Step 2: Rescue Team Dashboard) ---

let buzzerIntervalId: number | null = null;
let isBuzzerActive = false;
let activeBuzzerNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

/**
 * Returns current state of Web Audio context.
 */
export function getAudioContextState(): 'running' | 'suspended' | 'closed' | 'unsupported' {
  const ctx = getAudioContext();
  if (!ctx) return 'unsupported';
  return ctx.state as 'running' | 'suspended' | 'closed';
}

/**
 * Explicitly attempts to resume the AudioContext after a user gesture.
 * Returns true if the context is running and audio can be played.
 */
export async function resumeAudioContext(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (err) {
      console.warn('ResQNet Sound: Could not resume AudioContext:', err);
      return false;
    }
  }

  return ctx.state === 'running';
}

/**
 * Helper to play one dual-pulse buzzer cycle.
 */
function playBuzzerCycle(): void {
  if (!isBuzzerActive) return;

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  try {
    const now = ctx.currentTime;

    // Pulse 1: 720 Hz (alert tone)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(720, now);

    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.18);

    const nodeRef1 = { osc: osc1, gain: gain1 };
    activeBuzzerNodes.push(nodeRef1);

    osc1.onended = () => {
      try {
        osc1.disconnect();
        gain1.disconnect();
      } catch {}
      activeBuzzerNodes = activeBuzzerNodes.filter((n) => n !== nodeRef1);
    };

    // Pulse 2: 920 Hz (higher warning frequency)
    const start2 = now + 0.22;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(920, start2);

    gain2.gain.setValueAtTime(0.0001, start2);
    gain2.gain.exponentialRampToValueAtTime(0.14, start2 + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, start2 + 0.20);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(start2);
    osc2.stop(start2 + 0.22);

    const nodeRef2 = { osc: osc2, gain: gain2 };
    activeBuzzerNodes.push(nodeRef2);

    osc2.onended = () => {
      try {
        osc2.disconnect();
        gain2.disconnect();
      } catch {}
      activeBuzzerNodes = activeBuzzerNodes.filter((n) => n !== nodeRef2);
    };
  } catch (err) {
    console.warn('ResQNet Sound: Error playing buzzer cycle:', err);
  }
}

/**
 * Starts the continuous emergency buzzer loop.
 * - Does not create duplicate audio loops if already running.
 * - Detects if audio is blocked/suspended by the browser.
 * - Returns { playing: boolean, blocked: boolean }.
 */
export async function startContinuousBuzzer(): Promise<{ playing: boolean; blocked: boolean }> {
  try {
    const ctx = getAudioContext();
    if (!ctx) return { playing: false, blocked: true };

    // Try to resume if suspended
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Browser autoplay blocked
      }
    }

    if (ctx.state !== 'running') {
      // Audio is blocked until user interaction
      isBuzzerActive = true; // Mark as wanted so user unlock starts immediately
      return { playing: false, blocked: true };
    }

    // If already playing in a loop, avoid duplicate intervals
    if (isBuzzerActive && buzzerIntervalId !== null) {
      return { playing: true, blocked: false };
    }

    isBuzzerActive = true;

    // Play immediate first cycle
    playBuzzerCycle();

    // Loop every 750ms
    if (buzzerIntervalId === null) {
      buzzerIntervalId = window.setInterval(() => {
        if (!isBuzzerActive) {
          stopContinuousBuzzer();
          return;
        }
        playBuzzerCycle();
      }, 750);
    }

    return { playing: true, blocked: false };
  } catch (err) {
    console.warn('ResQNet Sound: Failed to start continuous buzzer:', err);
    return { playing: false, blocked: false };
  }
}

/**
 * Stops the continuous emergency buzzer immediately and cleans up all active audio nodes.
 */
export function stopContinuousBuzzer(): void {
  isBuzzerActive = false;

  if (buzzerIntervalId !== null) {
    clearInterval(buzzerIntervalId);
    buzzerIntervalId = null;
  }

  // Disconnect and stop all in-flight oscillators
  activeBuzzerNodes.forEach(({ osc, gain }) => {
    try {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    } catch {}
  });
  activeBuzzerNodes = [];
}

/**
 * Checks if the continuous buzzer is actively sounding.
 */
export function isContinuousBuzzerPlaying(): boolean {
  return isBuzzerActive && sharedAudioContext?.state === 'running' && buzzerIntervalId !== null;
}

export default {
  playConfirmationBeep,
  isAudioSupported,
  getAudioContextState,
  resumeAudioContext,
  startContinuousBuzzer,
  stopContinuousBuzzer,
  isContinuousBuzzerPlaying,
};
