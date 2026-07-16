import { useAppStore } from "../store";

function CogIcon() {
  return (
    <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm9.4 3.1-1.1-.2a7.5 7.5 0 0 0-.6-1.5l.7-.9a1 1 0 0 0-.1-1.3l-1.4-1.4a1 1 0 0 0-1.3-.1l-.9.7a7.5 7.5 0 0 0-1.5-.6l-.2-1.1A1 1 0 0 0 14 4h-4a1 1 0 0 0-1 .9l-.2 1.1a7.5 7.5 0 0 0-1.5.6l-.9-.7a1 1 0 0 0-1.3.1L3.7 7.4a1 1 0 0 0-.1 1.3l.7.9a7.5 7.5 0 0 0-.6 1.5l-1.1.2A1 1 0 0 0 2 12.6v2a1 1 0 0 0 .9 1l1.1.2c.14.53.34 1.03.6 1.5l-.7.9a1 1 0 0 0 .1 1.3l1.4 1.4a1 1 0 0 0 1.3.1l.9-.7c.47.26.97.46 1.5.6l.2 1.1a1 1 0 0 0 1 .9h4a1 1 0 0 0 1-.9l.2-1.1c.53-.14 1.03-.34 1.5-.6l.9.7a1 1 0 0 0 1.3-.1l1.4-1.4a1 1 0 0 0 .1-1.3l-.7-.9c.26-.47.46-.97.6-1.5l1.1-.2a1 1 0 0 0 .9-1v-2a1 1 0 0 0-.9-1.1z"
      />
    </svg>
  );
}

export function Controls() {
  const running = useAppStore((s) => s.session.running);
  const startPause = useAppStore((s) => s.startPause);
  const skip = useAppStore((s) => s.skip);
  const toggleSettings = useAppStore((s) => s.toggleSettings);
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const goWelcome = useAppStore((s) => s.goWelcome);

  return (
    <div className="controls">
      <button type="button" className="btn primary" onClick={startPause}>
        {running ? "PAUSE" : "START"}
      </button>
      <button type="button" className="btn" onClick={skip} title="Skip phase">
        SKIP
      </button>
      <button
        type="button"
        className={`btn icon ${settingsOpen ? "active" : ""}`}
        onClick={toggleSettings}
        title="Settings"
        aria-label="Settings"
      >
        <CogIcon />
      </button>
      <button
        type="button"
        className="btn icon close-btn"
        onClick={goWelcome}
        title="Close"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
