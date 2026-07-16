import { formatTime, phaseLabel } from "../timer/engine";
import { useAppStore } from "../store";

export function TimerDisplay() {
  const remainingMs = useAppStore((s) => s.session.remainingMs);
  const phase = useAppStore((s) => s.session.phase);
  const running = useAppStore((s) => s.session.running);
  const done = useAppStore((s) => s.session.focusesCompleted);
  const total = useAppStore((s) => s.session.totalFocuses);
  const splitMode = useAppStore((s) => s.session.splitMode);

  const dots = Math.min(total, 12);
  const filled = Math.min(done, dots);

  return (
    <div className={`timer-display ${running ? "running" : "paused"}`}>
      <div className="phase-label">
        {phaseLabel(phase)} · {splitMode}
      </div>
      <div className="time">{formatTime(remainingMs)}</div>
      <div className="cycle-meta">
        {done}/{total}
      </div>
      <div className="cycle-dots" aria-label={`${done} of ${total} focuses`}>
        {Array.from({ length: dots }, (_, i) => (
          <span key={i} className={`dot ${i < filled ? "filled" : ""}`} />
        ))}
      </div>
    </div>
  );
}
