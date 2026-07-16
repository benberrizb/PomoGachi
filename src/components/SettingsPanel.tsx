import { THEMES } from "../themes";
import type { ThemeId } from "../types";
import { useAppStore } from "../store";

export function SettingsPanel() {
  const open = useAppStore((s) => s.settingsOpen);
  const settings = useAppStore((s) => s.settings);
  const setTheme = useAppStore((s) => s.setTheme);
  const setPositionLocked = useAppStore((s) => s.setPositionLocked);
  const setAutostart = useAppStore((s) => s.setAutostart);
  const resetPhase = useAppStore((s) => s.resetPhase);
  const toggleSettings = useAppStore((s) => s.toggleSettings);

  if (!open) return null;

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <span>SETTINGS</span>
        <button type="button" className="btn icon" onClick={toggleSettings} aria-label="Close">
          X
        </button>
      </div>

      <label className="field">
        <span>Theme</span>
        <div className="theme-picks">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={`theme-pick ${settings.theme === id ? "active" : ""}`}
              onClick={() => setTheme(id)}
            >
              {THEMES[id].label}
            </button>
          ))}
        </div>
      </label>

      <label className="field row">
        <span>Lock position</span>
        <input
          type="checkbox"
          checked={settings.positionLocked}
          onChange={(e) => setPositionLocked(e.target.checked)}
        />
      </label>

      <label className="field row">
        <span>Start with Windows</span>
        <input
          type="checkbox"
          checked={settings.autostart}
          onChange={(e) => void setAutostart(e.target.checked)}
        />
      </label>

      <p className="settings-note">
        Splits are chosen at start: 25/5 or 50/10.
      </p>

      <button type="button" className="btn" onClick={resetPhase}>
        Reset timer
      </button>
    </div>
  );
}
