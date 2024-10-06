// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use std::process::Command;
use std::fs;
use serde_json::json;
use std::path::{Path, PathBuf};

fn build_tree(path: &Path, full_path: String) -> serde_json::Value {
    let mut contents = vec![];
     // Read the directory entries
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.filter_map(Result::ok) {
            let entry_path = entry.path();
            let entry_name = entry.file_name().into_string().unwrap_or_default();
            let entry_full_path = format!("{}/{}", full_path, entry_name);

            if entry.metadata().map(|m| m.is_dir()).unwrap_or(false) {
                // If it's a directory, recursively build its tree
                contents.push(build_tree(&entry_path, entry_full_path));
            } else {
                // If it's a file, push a JSON object with full path
                contents.push(json!({
                    "type": "file",
                    "name": entry_name,
                    "full_path": entry_full_path
                }));
            }
        }
    }

    json!({
        "name": path.file_name().unwrap().to_string_lossy(),
        "full_path": full_path,
        "type": "directory",
        "contents": contents,
    })
}

fn example(path: &str) -> String {
    let path = Path::new(path);
    let full_path = path.display().to_string(); // Get the full path

    // Build the directory tree starting from the provided path
    let tree = build_tree(path, full_path);
    
    // Convert the tree to a JSON string
    serde_json::to_string(&tree).unwrap_or_else(|_| "{}".to_string())
}

fn load_json_data(path: &str) -> String {
    let output = Command::new("tree")
        .arg("-J")
        .arg(path)
        .arg("-I")
        .arg("target")
        .output()
        .expect("failed to execute process");

    let result_example = example(path);
    println!("result_example: {}", result_example);
    return result_example;


    //     let s = String::from_utf8_lossy(&output.stdout);
    //     return s.to_string();
    // }

    // return "".to_string();
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
