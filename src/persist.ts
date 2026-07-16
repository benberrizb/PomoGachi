import { Store } from "@tauri-apps/plugin-store";
import type { PersistedState, SplitMode } from "./types";
import { DEFAULT_SESSION, DEFAULT_SETTINGS } from "./types";

const STORE_FILE = "pomodoro-bot.json";
const STORE_KEY = "state";

let storePromise: Promise<Store> | null = null;

async function getStore(): Promise<Store | null> {
  try {
    if (!storePromise) {
      storePromise = Store.load(STORE_FILE);
    }
    return await storePromise;
  } catch {
    return null;
  }
}

function normalizeSplitMode(raw: unknown): SplitMode {
  return raw === "50/10" ? "50/10" : "25/5";
}

export async function loadPersisted(): Promise<PersistedState> {
  const fallback: PersistedState = {
    settings: { ...DEFAULT_SETTINGS },
    session: { ...DEFAULT_SESSION },
  };

  try {
    const store = await getStore();
    if (!store) return fallback;
    const raw = await store.get<Record<string, unknown>>(STORE_KEY);
    if (!raw) return fallback;

    const rawSettings = (raw.settings ?? {}) as Record<string, unknown>;
    const splitMode = normalizeSplitMode(rawSettings.splitMode);

    return {
      settings: {
        ...DEFAULT_SETTINGS,
        ...rawSettings,
        splitMode,
        lastStudyMinutes:
          typeof rawSettings.lastStudyMinutes === "number"
            ? rawSettings.lastStudyMinutes
            : DEFAULT_SETTINGS.lastStudyMinutes,
        theme: (rawSettings.theme as PersistedState["settings"]["theme"]) ?? DEFAULT_SETTINGS.theme,
        positionLocked: Boolean(rawSettings.positionLocked),
        position:
          (rawSettings.position as PersistedState["settings"]["position"]) ?? null,
        autostart: Boolean(rawSettings.autostart),
      },
      session: {
        ...DEFAULT_SESSION,
        ...(raw.session as object),
        splitMode,
      },
    };
  } catch {
    return fallback;
  }
}

export async function savePersisted(state: PersistedState): Promise<void> {
  try {
    const store = await getStore();
    if (!store) return;
    await store.set(STORE_KEY, state);
    await store.save();
  } catch {
    // Persistence is best-effort in browser preview.
  }
}
