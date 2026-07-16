use tauri::{
  image::Image,
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
  Emitter, Listener, Manager, WindowEvent,
};
use tauri_plugin_autostart::MacosLauncher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_autostart::init(
      MacosLauncher::LaunchAgent,
      None,
    ))
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let window_icon = Image::from_bytes(include_bytes!("../icons/icon.png"))
        .expect("failed to load app icon");
      let tray_icon = Image::from_bytes(include_bytes!("../icons/icon.png"))
        .expect("failed to load tray icon");

      if let Some(win) = app.get_webview_window("main") {
        let _ = win.set_icon(window_icon);
      }

      let show_i = MenuItem::with_id(app, "show", "Show Overlay", true, None::<&str>)?;
      let hide_i = MenuItem::with_id(app, "hide", "Hide Overlay", true, None::<&str>)?;
      let toggle_i = MenuItem::with_id(app, "toggle", "Start / Pause", true, None::<&str>)?;
      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&show_i, &hide_i, &toggle_i, &quit_i])?;

      let _tray = TrayIconBuilder::new()
        .icon(tray_icon)
        .menu(&menu)
        .tooltip("PomoGachi")
        .on_menu_event(|app, event| match event.id.as_ref() {
          "show" => {
            if let Some(win) = app.get_webview_window("main") {
              let _ = win.show();
              let _ = win.set_focus();
            }
          }
          "hide" => {
            if let Some(win) = app.get_webview_window("main") {
              let _ = win.hide();
            }
          }
          "toggle" => {
            let _ = app.emit("tray-toggle-timer", ());
          }
          "quit" => {
            app.exit(0);
          }
          _ => {}
        })
        .on_tray_icon_event(|tray, event| {
          if let TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
          } = event
          {
            let app = tray.app_handle();
            if let Some(win) = app.get_webview_window("main") {
              let _ = win.show();
              let _ = win.set_focus();
            }
          }
        })
        .build(app)?;

      let handle = app.handle().clone();
      app.listen("app-quit", move |_| {
        handle.exit(0);
      });

      Ok(())
    })
    .on_window_event(|window, event| {
      if let WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        let _ = window.hide();
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
