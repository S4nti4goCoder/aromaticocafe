/**
 * Plays a gentle beep using the Web Audio API. No external files needed.
 * Silently no-ops if the browser blocks audio without a user gesture.
 */
let ctx: AudioContext | null = null;
let unlockRegistered = false;

// Browsers keep a freshly created AudioContext "suspended" until the first user
// gesture (autoplay policy). Resume it on the first interaction so later
// notification sounds can play without the console warning.
function registerUnlock(context: AudioContext) {
  if (unlockRegistered) return;
  unlockRegistered = true;
  const resume = () => {
    void context.resume();
    window.removeEventListener("pointerdown", resume);
    window.removeEventListener("keydown", resume);
  };
  window.addEventListener("pointerdown", resume);
  window.addEventListener("keydown", resume);
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx) registerUnlock(ctx);
  return ctx;
}

export function playNotificationSound(severity: "info" | "warning" | "danger" = "info") {
  const context = getCtx();
  if (!context) return;
  // Still blocked by the autoplay policy (no user gesture yet): skip silently so
  // we don't start an oscillator on a suspended context (which logs a warning).
  if (context.state === "suspended") {
    void context.resume();
    return;
  }
  try {
    // Two-tone gentle chime
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);

    const baseFreq = severity === "danger" ? 880 : severity === "warning" ? 700 : 600;
    const t0 = context.currentTime;

    osc.frequency.setValueAtTime(baseFreq, t0);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, t0 + 0.1);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);

    osc.start(t0);
    osc.stop(t0 + 0.4);
  } catch {
    // ignore
  }
}
