# PomoGachi

Always-on-top pomodoro overlay for Windows with swapable skins and a pixel cat.

## Stack

- Tauri 2 + Vite + React + TypeScript
- Themes: OLED, Game Boy, Tamagotchi
- Splits: 25/5 or 50/10 across a chosen study length

## Develop

```bash
npm install
npm run tauri:dev
```

Requires [Rust](https://rustup.rs/) and Windows MSVC build tools.

## Build installer

```bash
npm run tauri:build
```

Installers land under `src-tauri/target/release/bundle/` (NSIS `.exe` and MSI).

## Usage

- Launch screen shows **PomoGachi** with Start / Exit
- Pick 25/5 or 50/10, then study length (e.g. 4h = 8×25/5 or 4×50/10)
- Finishing a session shows a congrats screen with confetti
- Drag the overlay to reposition; tray for show/hide / quit
