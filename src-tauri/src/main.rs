// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, io::Read};

use tauri::api::path::app_data_dir;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn unzip(path: &str, app_handle: tauri::AppHandle) {
    let fname = std::path::Path::new(path);
    let file = fs::File::open(fname).unwrap();

    let mut archive = zip::ZipArchive::new(file).unwrap();

    archive.extract(app_handle.path_resolver().app_data_dir().unwrap());

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        // let mut contents = String::new();
        // file.read_to_string(&mut contents);
        println!("{}", file.name());

        // if (*file.name()).ends_with('/') {
        //     println!("File {} extracted to \"{}\"", i, outpath.display());
        //     fs::create_dir_all(&outpath).unwrap();
        // } else {
        //     println!(
        //         "File {} extracted to \"{}\" ({} bytes)",
        //         i,
        //         outpath.display(),
        //         file.size()
        //     );
        //     if let Some(p) = outpath.parent() {
        //         if !p.exists() {
        //             fs::create_dir_all(p).unwrap();
        //         }
        //     }
        //     let mut outfile = fs::File::create(&outpath).unwrap();
        //     io::copy(&mut file, &mut outfile).unwrap();
        // }

        // Get and Set permissions
        // #[cfg(unix)]
        // {
        //     use std::os::unix::fs::PermissionsExt;

        //     if let Some(mode) = file.unix_mode() {
        //         fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).unwrap();
        //     }
        // }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, unzip])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
