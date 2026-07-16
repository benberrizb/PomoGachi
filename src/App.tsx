import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { PetView } from "./components/PetView";
import { TimerDisplay } from "./components/TimerDisplay";
import { Controls } from "./components/Controls";
import { SettingsPanel } from "./components/SettingsPanel";
import { LaunchScreen, DurationScreen } from "./components/LaunchScreen";
import { CongratsScreen } from "./components/CongratsScreen";
import { useAppStore } from "./store";
import "./App.css";

export default function App() {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);
  const uiPhase = useAppStore((s) => s.uiPhase);
  const tick = useAppStore((s) => s.tick);
  const startPause = useAppStore((s) => s.startPause);
  const savePosition = useAppStore((s) => s.savePosition);
  const positionLocked = useAppStore((s) => s.settings.positionLocked);
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const dragMoved = useRef(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (uiPhase !== "overlay") return;
    const id = window.setInterval(() => tick(), 250);
    return () => window.clearInterval(id);
  }, [tick, uiPhase]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void listen("tray-toggle-timer", () => {
      if (useAppStore.getState().uiPhase !== "overlay") return;
      startPause();
    }).then((fn) => {
      unlisten = fn;
    });
    return () => unlisten?.();
  }, [startPause]);

  const onPointerDown = async (e: ReactPointerEvent) => {
    if (uiPhase !== "overlay") return;
    if (positionLocked || settingsOpen) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, input, .settings-panel, .controls")) return;
    dragMoved.current = true;
    try {
      await getCurrentWindow().startDragging();
    } catch {
      // Browser preview — ignore.
    }
  };

  const onPointerUp = async () => {
    if (uiPhase !== "overlay") return;
    if (!dragMoved.current || positionLocked) return;
    dragMoved.current = false;
    try {
      const pos = await getCurrentWindow().outerPosition();
      const scale = await getCurrentWindow().scaleFactor();
      savePosition(pos.x / scale, pos.y / scale);
    } catch {
      // ignore
    }
  };

  if (!hydrated) {
    return <div className="shell loading">…</div>;
  }

  if (uiPhase === "welcome") {
    return (
      <div className="shell launch-shell">
        <div className="bezel launch-bezel">
          <div className="screen">
            <LaunchScreen />
          </div>
        </div>
      </div>
    );
  }

  if (uiPhase === "askDuration") {
    return (
      <div className="shell launch-shell">
        <div className="bezel launch-bezel">
          <div className="screen">
            <DurationScreen />
          </div>
        </div>
      </div>
    );
  }

  if (uiPhase === "congrats") {
    return (
      <div className="shell launch-shell congrats-shell">
        <div className="bezel launch-bezel">
          <div className="screen congrats-frame">
            <CongratsScreen />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`shell ${settingsOpen ? "settings-open" : ""}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className="bezel">
        <div className="screen">
          <PetView />
          <TimerDisplay />
          <Controls />
          <SettingsPanel />
        </div>
      </div>
    </div>
  );
}
