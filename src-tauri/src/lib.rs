// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use std::process::Command;

fn load_json_data(path: &str) -> String {
    let output = Command::new("tree")
        .arg("-J")
        .arg(path)
        .output()
        .expect("failed to execute process");

    if output.status.success() {
        let s = String::from_utf8_lossy(&output.stdout);
        println!("output: {}", s);
        return s.to_string();
    }

    return "".to_string();
}

//
#[tauri::command]
fn greet(name: &str) -> String {
    println!("greet: {}", name);
    load_json_data(name)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
