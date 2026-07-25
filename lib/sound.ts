// Short, quiet, synthesized tones via Web Audio — no bundled audio files,
// nothing to fetch, works offline by construction. Muted by default; the
// per-profile toggle lives in AppSettingsContext (Profile.soundEnabled).

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function beep(frequency: number, durationMs: number, volume: number): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

export function playCorrectTone(): void {
  beep(660, 70, 0.1);
}

export function playIncorrectTone(): void {
  beep(180, 110, 0.1);
}

export function playCompleteChime(): void {
  beep(880, 90, 0.12);
  setTimeout(() => beep(1175, 150, 0.12), 90);
}
