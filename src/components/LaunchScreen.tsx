import { useState } from "react";
import { useAppStore } from "../store";
import { SPLITS, cyclesForStudy, type SplitMode } from "../types";

export function LaunchScreen() {
  const goAskDuration = useAppStore((s) => s.goAskDuration);
  const quitApp = useAppStore((s) => s.quitApp);

  return (
    <div className="launch-screen">
      <div className="launch-brand">PomoGachi</div>
      <div className="launch-actions">
        <button type="button" className="btn primary launch-btn" onClick={goAskDuration}>
          Start
        </button>
        <button type="button" className="btn launch-btn" onClick={() => void quitApp()}>
          Exit
        </button>
      </div>
    </div>
  );
}

const PRESETS = [
  { minutes: 30, label: "30m" },
  { minutes: 60, label: "1h" },
  { minutes: 120, label: "2h" },
  { minutes: 240, label: "4h" },
] as const;

export function DurationScreen() {
  const settings = useAppStore((s) => s.settings);
  const beginStudySession = useAppStore((s) => s.beginStudySession);
  const goWelcome = useAppStore((s) => s.goWelcome);

  const [minutes, setMinutes] = useState<number>(settings.lastStudyMinutes || 120);
  const [custom, setCustom] = useState(String(settings.lastStudyMinutes || 120));
  const [splitMode, setSplitMode] = useState<SplitMode>(settings.splitMode);

  const cycles = cyclesForStudy(minutes, splitMode);
  const usedMinutes = cycles * SPLITS[splitMode].cycleMinutes;

  const apply = () => {
    const n = Math.max(1, Math.min(480, Math.round(Number(custom) || minutes)));
    void beginStudySession(n, splitMode);
  };

  return (
    <div className="launch-screen duration-screen">
      <div className="launch-brand small">PomoGachi</div>

      <p className="launch-tag">Split</p>
      <div className="duration-presets">
        {(["25/5", "50/10"] as SplitMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`btn duration-chip ${splitMode === mode ? "active" : ""}`}
            onClick={() => setSplitMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      <p className="launch-tag">Study length</p>
      <div className="duration-presets">
        {PRESETS.map((p) => (
          <button
            key={p.minutes}
            type="button"
            className={`btn duration-chip ${minutes === p.minutes ? "active" : ""}`}
            onClick={() => {
              setMinutes(p.minutes);
              setCustom(String(p.minutes));
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <label className="field duration-custom">
        <span>Custom (minutes)</span>
        <input
          type="number"
          min={1}
          max={480}
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            const n = Number(e.target.value);
            if (n > 0) setMinutes(n);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply();
          }}
        />
      </label>

      <p className="launch-preview">
        {cycles}× {splitMode}
        {usedMinutes !== minutes ? ` (${usedMinutes}m)` : ""}
      </p>

      <div className="launch-actions">
        <button type="button" className="btn primary launch-btn" onClick={apply}>
          Begin
        </button>
        <button type="button" className="btn launch-btn" onClick={goWelcome}>
          Back
        </button>
      </div>
    </div>
  );
}
