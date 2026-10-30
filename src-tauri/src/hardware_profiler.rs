use serde::Serialize;
use sysinfo::System;

#[derive(Serialize, Clone)]
pub struct SystemProfile {
    total_memory_mb: u64,
    free_memory_mb: u64,
    cpu_cores: usize,
    os_name: String,
    mode: String,
}

#[tauri::command]
pub fn get_hardware_profile() -> SystemProfile {
    let mut sys = System::new_all();
    sys.refresh_all();

    let total_memory_mb = sys.total_memory() / 1024 / 1024;
    let free_memory_mb = sys.free_memory() / 1024 / 1024;
    let cpu_cores = sys.cpus().len();
    let os_name = System::name().unwrap_or_else(|| "Unknown".to_string());

    // Determine execution mode based on RAM budget
    let mode = if total_memory_mb <= 2048 {
        "ULTRA_LIGHT_MODE (<150MB Allocated)".to_string()
    } else {
        "GPU-Accelerated Mode".to_string() // Assume workstation
    };

    SystemProfile {
        total_memory_mb,
        free_memory_mb,
        cpu_cores,
        os_name,
        mode,
    }
}
