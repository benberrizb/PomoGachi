import { useAppStore } from "../store";

/** Pixel cat — colors come from theme CSS vars (--pet-body / --pet-eye). */
function PixelCat({ anim }: { anim: string }) {
  // 16x16 style sprite drawn with unit squares in a 32x32 viewBox (2px cells)
  const cells: Array<[number, number]> = [
    // ears
    [6, 2], [8, 2], [20, 2], [22, 2],
    [4, 4], [6, 4], [8, 4], [10, 4], [18, 4], [20, 4], [22, 4], [24, 4],
    // head
    [6, 6], [8, 6], [10, 6], [12, 6], [14, 6], [16, 6], [18, 6], [20, 6], [22, 6],
    [4, 8], [6, 8], [8, 8], [10, 8], [12, 8], [14, 8], [16, 8], [18, 8], [20, 8], [22, 8], [24, 8],
    [4, 10], [6, 10], [10, 10], [12, 10], [14, 10], [16, 10], [18, 10], [22, 10], [24, 10],
    [4, 12], [6, 12], [8, 12], [10, 12], [12, 12], [14, 12], [16, 12], [18, 12], [20, 12], [22, 12], [24, 12],
    // body
    [8, 14], [10, 14], [12, 14], [14, 14], [16, 14], [18, 14], [20, 14],
    [6, 16], [8, 16], [10, 16], [12, 16], [14, 16], [16, 16], [18, 16], [20, 16], [22, 16],
    [6, 18], [8, 18], [10, 18], [12, 18], [14, 18], [16, 18], [18, 18], [20, 18], [22, 18],
    [6, 20], [8, 20], [10, 20], [12, 20], [14, 20], [16, 20], [18, 20], [20, 20], [22, 20],
    // legs
    [8, 22], [10, 22], [18, 22], [20, 22],
    [8, 24], [10, 24], [18, 24], [20, 24],
    // tail
    [24, 16], [26, 14], [28, 12], [28, 10],
  ];

  const eyes: Array<[number, number]> = [
    [8, 10], [20, 10],
  ];

  return (
    <svg
      className={`pet-svg pixel-cat anim-${anim}`}
      viewBox="0 0 32 28"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {cells.map(([x, y]) => (
        <rect key={`b-${x}-${y}`} className="pet-body" x={x} y={y} width={2} height={2} />
      ))}
      {eyes.map(([x, y]) => (
        <rect key={`e-${x}-${y}`} className="pet-eye" x={x} y={y} width={2} height={2} />
      ))}
    </svg>
  );
}

export function PetView() {
  const phase = useAppStore((s) => s.session.phase);
  const running = useAppStore((s) => s.session.running);

  const anim = !running ? "paused" : phase === "focus" ? "focusing" : "break";

  return (
    <div className="pet-view" data-anim={anim}>
      <PixelCat anim={anim} />
    </div>
  );
}
