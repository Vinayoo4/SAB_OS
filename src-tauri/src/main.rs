// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod hardware_profiler;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn trigger_alarm() {
    println!("[Hardware Bridge] SECURITY ALERT - Actuating physical cash drawer locks and sounding local physical sirens!");
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            hardware_profiler::get_hardware_profile,
            trigger_alarm
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
