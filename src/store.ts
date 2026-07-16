import { create } from "zustand";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { enable as enableAutostart, disable as disableAutostart, isEnabled as isAutostartEnabled } from "@tauri-apps/plugin-autostart";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow, LogicalPosition, LogicalSize, primaryMonitor } from "@tauri-apps/api/window";
import type { AppSettings, Phase, SessionSnapshot, SplitMode, ThemeId } from "./types";
import { cyclesForStudy, DEFAULT_SESSION, DEFAULT_SETTINGS } from "./types";
import {
  nextAfterPhaseComplete,
  phaseDurationMs,
  restoreRemaining,
} from "./timer/engine";
import { loadPersisted, savePersisted } from "./persist";
import { playPhaseChime } from "./sounds/chime";
import { applyThemeTokens, THEMES } from "./themes";

export type UiPhase = "welcome" | "askDuration" | "overlay" | "congrats";

const LAUNCH_SIZE = { width: 360, height: 380 };
const OVERLAY_SIZE = { width: 200, height: 280 };
const CONGRATS_SIZE = { width: 360, height: 340 };

interface AppStore {
  hydrated: boolean;
  uiPhase: UiPhase;
  settings: AppSettings;
  session: SessionSnapshot;
  settingsOpen: boolean;
  hydrate: () => Promise<void>;
  persist: () => void;
  goWelcome: () => void;
  goAskDuration: () => void;
  beginStudySession: (totalMinutes: number, splitMode: SplitMode) => Promise<void>;
  quitApp: () => Promise<void>;
  prepareLaunchWindow: () => Promise<void>;
  setTheme: (theme: ThemeId) => void;
  setPositionLocked: (locked: boolean) => void;
  setSplitMode: (mode: SplitMode) => void;
  setAutostart: (on: boolean) => Promise<void>;
  savePosition: (x: number, y: number) => void;
  restoreWindowPosition: () => Promise<void>;
  toggleSettings: () => void;
  startPause: () => void;
  skip: () => void;
  tick: (now?: number) => void;
  resetPhase: () => void;
  finishSession: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

async function notifyPhase(phase: Phase | "done"): Promise<void> {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const perm = await requestPermission();
      granted = perm === "granted";
    }
    if (!granted) return;
    const body =
      phase === "done"
        ? "Study session complete"
        : phase === "focus"
          ? "Focus time"
          : "Break time";
    sendNotification({ title: "PomoGachi", body });
  } catch {
    // Notifications unavailable outside Tauri.
  }
}

function scheduleSave(get: () => AppStore): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const { settings, session } = get();
    void savePersisted({ settings, session });
  }, 250);
}

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  uiPhase: "welcome",
  settings: { ...DEFAULT_SETTINGS },
  session: { ...DEFAULT_SESSION },
  settingsOpen: false,

  hydrate: async () => {
    const data = await loadPersisted();
    const mode = data.settings.splitMode;
    const session: SessionSnapshot = {
      ...DEFAULT_SESSION,
      ...data.session,
      phase: "focus",
      remainingMs: phaseDurationMs("focus", mode),
      running: false,
      endsAt: null,
      splitMode: mode,
    };
    applyThemeTokens(THEMES[data.settings.theme]);
    set({
      settings: data.settings,
      session,
      uiPhase: "welcome",
      hydrated: true,
    });
    try {
      const on = await isAutostartEnabled();
      if (on !== data.settings.autostart) {
        set({ settings: { ...get().settings, autostart: on } });
      }
    } catch {
      // ignore
    }
    void get().prepareLaunchWindow();
  },

  persist: () => scheduleSave(get),

  prepareLaunchWindow: async () => {
    try {
      const win = getCurrentWindow();
      await win.setSize(new LogicalSize(LAUNCH_SIZE.width, LAUNCH_SIZE.height));
      await win.setSkipTaskbar(false);
      await win.center();
      await win.setFocus();
    } catch {
      // Browser preview.
    }
  },

  goWelcome: () => {
    const mode = get().settings.splitMode;
    set({
      uiPhase: "welcome",
      settingsOpen: false,
      session: {
        ...get().session,
        running: false,
        endsAt: null,
        remainingMs: phaseDurationMs("focus", mode),
        phase: "focus",
      },
    });
    scheduleSave(get);
    void get().prepareLaunchWindow();
  },

  goAskDuration: () => set({ uiPhase: "askDuration" }),

  beginStudySession: async (totalMinutes, splitMode) => {
    const mins = Math.max(1, Math.min(480, Math.round(totalMinutes)));
    const totalFocuses = cyclesForStudy(mins, splitMode);
    const remainingMs = phaseDurationMs("focus", splitMode);
    set({
      settings: {
        ...get().settings,
        splitMode,
        lastStudyMinutes: mins,
      },
      session: {
        phase: "focus",
        remainingMs,
        running: true,
        focusesCompleted: 0,
        totalFocuses,
        endsAt: Date.now() + remainingMs,
        splitMode,
        totalStudyMinutes: mins,
      },
      uiPhase: "overlay",
      settingsOpen: false,
    });
    scheduleSave(get);
    try {
      const win = getCurrentWindow();
      await win.setSize(new LogicalSize(OVERLAY_SIZE.width, OVERLAY_SIZE.height));
      await win.setSkipTaskbar(false);
      await get().restoreWindowPosition();
      await win.setFocus();
    } catch {
      // ignore
    }
  },

  quitApp: async () => {
    try {
      await emit("app-quit");
    } catch {
      window.close();
    }
  },

  setTheme: (theme) => {
    applyThemeTokens(THEMES[theme]);
    set({ settings: { ...get().settings, theme } });
    scheduleSave(get);
  },

  setPositionLocked: (locked) => {
    set({ settings: { ...get().settings, positionLocked: locked } });
    scheduleSave(get);
  },

  setSplitMode: (mode) => {
    set({ settings: { ...get().settings, splitMode: mode } });
    scheduleSave(get);
  },

  setAutostart: async (on) => {
    try {
      if (on) await enableAutostart();
      else await disableAutostart();
    } catch {
      // Plugin may be unavailable in browser.
    }
    set({ settings: { ...get().settings, autostart: on } });
    scheduleSave(get);
  },

  savePosition: (x, y) => {
    set({ settings: { ...get().settings, position: { x, y } } });
    scheduleSave(get);
  },

  restoreWindowPosition: async () => {
    try {
      const win = getCurrentWindow();
      const pos = get().settings.position;
      if (pos) {
        await win.setPosition(new LogicalPosition(pos.x, pos.y));
        return;
      }
      const monitor = await primaryMonitor();
      if (!monitor) return;
      const scale = monitor.scaleFactor;
      const screenW = monitor.size.width / scale;
      const x = Math.max(0, screenW - 220);
      const y = 48;
      await win.setPosition(new LogicalPosition(x, y));
      get().savePosition(x, y);
    } catch {
      // ignore
    }
  },

  toggleSettings: () => set({ settingsOpen: !get().settingsOpen }),

  startPause: () => {
    const { session } = get();
    if (session.running) {
      const remainingMs = restoreRemaining(session);
      set({
        session: { ...session, running: false, remainingMs, endsAt: null },
      });
    } else {
      const remainingMs =
        session.remainingMs > 0
          ? session.remainingMs
          : phaseDurationMs(session.phase, session.splitMode);
      set({
        session: {
          ...session,
          running: true,
          remainingMs,
          endsAt: Date.now() + remainingMs,
        },
      });
    }
    scheduleSave(get);
  },

  skip: () => {
    const { session } = get();
    const result = nextAfterPhaseComplete(session);
    if (result === "done") {
      get().finishSession();
      return;
    }
    const remainingMs = phaseDurationMs(result.phase, session.splitMode);
    const running = session.running;
    set({
      session: {
        ...session,
        phase: result.phase,
        focusesCompleted: result.focusesCompleted,
        remainingMs,
        endsAt: running ? Date.now() + remainingMs : null,
      },
    });
    void playPhaseChime(result.phase === "focus" ? "focus" : "break");
    scheduleSave(get);
  },

  resetPhase: () => {
    const { session } = get();
    const remainingMs = phaseDurationMs(session.phase, session.splitMode);
    set({
      session: {
        ...session,
        remainingMs,
        running: false,
        endsAt: null,
      },
    });
    scheduleSave(get);
  },

  finishSession: () => {
    void playPhaseChime("break");
    void notifyPhase("done");
    set({
      uiPhase: "congrats",
      settingsOpen: false,
      session: {
        ...get().session,
        running: false,
        endsAt: null,
      },
    });
    scheduleSave(get);
    void (async () => {
      try {
        const win = getCurrentWindow();
        await win.setSize(new LogicalSize(CONGRATS_SIZE.width, CONGRATS_SIZE.height));
        await win.setSkipTaskbar(false);
        await win.center();
        await win.setFocus();
      } catch {
        // ignore
      }
    })();
  },

  tick: (now = Date.now()) => {
    const { session } = get();

    if (!session.running || session.endsAt == null) return;

    const remainingMs = Math.max(0, session.endsAt - now);
    if (remainingMs > 0) {
      set({ session: { ...session, remainingMs } });
      return;
    }

    const result = nextAfterPhaseComplete(session);
    if (result === "done") {
      get().finishSession();
      return;
    }

    const duration = phaseDurationMs(result.phase, session.splitMode);
    set({
      session: {
        ...session,
        phase: result.phase,
        focusesCompleted: result.focusesCompleted,
        remainingMs: duration,
        running: true,
        endsAt: now + duration,
      },
    });

    void playPhaseChime(result.phase === "focus" ? "focus" : "break");
    void notifyPhase(result.phase);
    scheduleSave(get);
  },
}));
