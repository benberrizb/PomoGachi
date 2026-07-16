import type { Phase, SessionSnapshot, SplitMode } from "../types";
import { SPLITS } from "../types";

export function phaseDurationMs(phase: Phase, mode: SplitMode): number {
  const split = SPLITS[mode];
  return (phase === "focus" ? split.focusMinutes : split.breakMinutes) * 60_000;
}

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function phaseLabel(phase: Phase): string {
  return phase === "focus" ? "FOCUS" : "BREAK";
}

/**
 * Advance after a phase ends.
 * Returns null when the whole study session is done (last break finished,
 * or last focus finished if we skip trailing break — we include breaks).
 */
export function nextAfterPhaseComplete(
  session: SessionSnapshot,
): { phase: Phase; focusesCompleted: number } | "done" {
  if (session.phase === "focus") {
    const focusesCompleted = session.focusesCompleted + 1;
    // Always take a break after focus (including after the last focus)
    return { phase: "break", focusesCompleted };
  }

  // Break finished
  if (session.focusesCompleted >= session.totalFocuses) {
    return "done";
  }
  return { phase: "focus", focusesCompleted: session.focusesCompleted };
}

export function restoreRemaining(session: SessionSnapshot, now = Date.now()): number {
  if (session.running && session.endsAt != null) {
    return Math.max(0, session.endsAt - now);
  }
  return session.remainingMs;
}
