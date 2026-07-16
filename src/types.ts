export type ThemeId = "oled" | "gameboy" | "tamagotchi" | "ocean";

export type Phase = "focus" | "break";

export type SplitMode = "25/5" | "50/10";

export interface SplitConfig {
  focusMinutes: number;
  breakMinutes: number;
  cycleMinutes: number;
}

export const SPLITS: Record<SplitMode, SplitConfig> = {
  "25/5": { focusMinutes: 25, breakMinutes: 5, cycleMinutes: 30 },
  "50/10": { focusMinutes: 50, breakMinutes: 10, cycleMinutes: 60 },
};

export interface SessionSnapshot {
  phase: Phase;
  remainingMs: number;
  running: boolean;
  /** Completed focus blocks in this study session */
  focusesCompleted: number;
  /** Total focus blocks planned for this study session */
  totalFocuses: number;
  endsAt: number | null;
  splitMode: SplitMode;
  totalStudyMinutes: number;
}

export interface AppSettings {
  theme: ThemeId;
  positionLocked: boolean;
  position: { x: number; y: number } | null;
  splitMode: SplitMode;
  lastStudyMinutes: number;
  autostart: boolean;
}

export interface PersistedState {
  settings: AppSettings;
  session: SessionSnapshot;
}

export const DEFAULT_SESSION: SessionSnapshot = {
  phase: "focus",
  remainingMs: SPLITS["25/5"].focusMinutes * 60_000,
  running: false,
  focusesCompleted: 0,
  totalFocuses: 1,
  endsAt: null,
  splitMode: "25/5",
  totalStudyMinutes: 30,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "tamagotchi",
  positionLocked: false,
  position: null,
  splitMode: "25/5",
  lastStudyMinutes: 120,
  autostart: false,
};

export function cyclesForStudy(totalMinutes: number, mode: SplitMode): number {
  const cycle = SPLITS[mode].cycleMinutes;
  return Math.max(1, Math.floor(totalMinutes / cycle));
}
