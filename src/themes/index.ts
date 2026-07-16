import type { ThemeId } from "../types";

export interface ThemeTokens {
  id: ThemeId;
  label: string;
  font: string;
  bg: string;
  panel: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentAlt: string;
  exit: string;
  petBody: string;
  petEye: string;
  bezel: string;
  radius: string;
  shadow: string;
  pixelate: boolean;
}

export const THEMES: Record<ThemeId, ThemeTokens> = {
  oled: {
    id: "oled",
    label: "OLED",
    font: '"IBM Plex Mono", "Cascadia Mono", "Consolas", monospace',
    bg: "transparent",
    panel: "#000000",
    border: "#ffffff",
    text: "#ffffff",
    muted: "#888888",
    accent: "#ffffff",
    accentAlt: "#cccccc",
    exit: "#ff2244",
    petBody: "#ffffff",
    petEye: "#000000",
    bezel: "#000000",
    radius: "2px",
    shadow: "none",
    pixelate: false,
  },
  gameboy: {
    id: "gameboy",
    label: "Game Boy",
    font: '"Press Start 2P", "VT323", "Courier New", monospace',
    bg: "transparent",
    panel: "#9bbc0f",
    border: "#0f380f",
    text: "#0f380f",
    muted: "#306230",
    accent: "#0f380f",
    accentAlt: "#306230",
    exit: "#0f380f",
    petBody: "#0f380f",
    petEye: "#9bbc0f",
    bezel: "#8bac0f",
    radius: "4px",
    shadow: "4px 4px 0 #0f380f",
    pixelate: true,
  },
  tamagotchi: {
    id: "tamagotchi",
    label: "Tamagotchi",
    font: '"Nunito", "Segoe UI", sans-serif',
    bg: "transparent",
    panel: "#c8e6c0",
    border: "#e89ab0",
    text: "#2d4a3e",
    muted: "#5a7a6a",
    accent: "#e85a7a",
    accentAlt: "#7ec8a0",
    exit: "#e85a7a",
    petBody: "#e85a7a",
    petEye: "#2d4a3e",
    bezel: "#f0a0b8",
    radius: "28px",
    shadow: "0 8px 0 #d07090",
    pixelate: true,
  },
};

export function applyThemeTokens(theme: ThemeTokens): void {
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.style.setProperty("--font", theme.font);
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--panel", theme.panel);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-alt", theme.accentAlt);
  root.style.setProperty("--exit", theme.exit);
  root.style.setProperty("--pet-body", theme.petBody);
  root.style.setProperty("--pet-eye", theme.petEye);
  root.style.setProperty("--bezel", theme.bezel);
  root.style.setProperty("--radius", theme.radius);
  root.style.setProperty("--shadow", theme.shadow);
}
