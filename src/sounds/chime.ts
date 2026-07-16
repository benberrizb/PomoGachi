let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Short retro-ish beep for phase transitions. */
export async function playPhaseChime(kind: "focus" | "break"): Promise<void> {
  try {
    const audio = getCtx();
    if (audio.state === "suspended") await audio.resume();

    const now = audio.currentTime;
    const freqs = kind === "focus" ? [523.25, 659.25] : [392.0, 523.25, 659.25];

    freqs.forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18 + i * 0.12);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + 0.22 + i * 0.12);
    });
  } catch {
    // Audio may be blocked until user gesture — ignore.
  }
}
