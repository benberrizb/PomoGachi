import { useMemo } from "react";
import { useAppStore } from "../store";
import { CONFETTI_COLORS } from "../themes/confetti";
import type { ThemeId } from "../types";

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
  drift: number;
}

function makePieces(count: number, theme: ThemeId): Piece[] {
  const colors = CONFETTI_COLORS[theme];
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 2.4,
    duration: 2.2 + Math.random() * 2.8,
    color: colors[id % colors.length]!,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
    drift: -40 + Math.random() * 80,
  }));
}

export function CongratsScreen() {
  const goWelcome = useAppStore((s) => s.goWelcome);
  const totalFocuses = useAppStore((s) => s.session.totalFocuses);
  const splitMode = useAppStore((s) => s.session.splitMode);
  const theme = useAppStore((s) => s.settings.theme);
  const pieces = useMemo(() => makePieces(48, theme), [theme]);

  return (
    <div className="congrats-screen">
      <div className="confetti-layer" aria-hidden>
        {pieces.map((p) => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.55,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              ["--drift" as string]: `${p.drift}px`,
              ["--spin" as string]: `${p.rotate}deg`,
            }}
          />
        ))}
      </div>

      <div className="congrats-content">
        <div className="congrats-title">Congrats!</div>
        <p className="congrats-sub">
          You finished {totalFocuses}× {splitMode}
        </p>
        <button type="button" className="btn primary launch-btn" onClick={goWelcome}>
          Done
        </button>
      </div>
    </div>
  );
}
