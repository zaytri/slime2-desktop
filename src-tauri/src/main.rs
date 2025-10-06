//! Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::OnceLock;

use tauri::{AppHandle, Emitter, Manager};

mod commands;
mod file;
mod secret;
mod server;

// thanks to https://github.com/tauri-apps/tauri/discussions/6309#discussioncomment-10295527
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();
fn get_app_handle() -> AppHandle {
	APP_HANDLE.get().unwrap().clone()
}

#[derive(Clone, serde::Serialize)]
struct SingleInstancePayload {
	args: Vec<String>,
	cwd: String,
}

#[tokio::main]
async fn main() {
	println!("Welcome to slime2!");

	let connections = server::websocket::WebsocketConnections::default();

	tauri::Builder::default()
		.plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd| {}))
		.plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
			println!("{}, {argv:?}, {cwd}", app.package_info().name);
			app.emit(
				"single-instance",
				SingleInstancePayload { args: argv, cwd },
			)
			.unwrap();
		}))
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_clipboard_manager::init())
		.manage(connections.clone())
		.setup(|app: &mut tauri::App| {
			let app_handle = app.app_handle().clone();

			if let Err(..) = APP_HANDLE.set(app_handle.clone()) {
				eprintln!("Error setting static app handle!");
			}

			// empty temp folder on startup
			if let Err(error) = file::empty_temp_folder(&app_handle) {
				eprintln!("Error emptying temp folder! {}", error);
			}

			// clean tiles folder on startup
			if let Err(error) = file::clean_tiles_folder(&app_handle) {
				eprintln!("Error cleaning tiles folder! {}", error);
			}

			server::setup(
				connections,
				(
					file::widget_server_path(&app_handle),
					file::tiles_path(&app_handle),
					file::temp_files_path(&app_handle),
				),
			)
		})
		.invoke_handler(tauri::generate_handler![
			commands::send_websocket_message,
			commands::copy_widget,
			commands::delete_widget,
			commands::install_custom_widget,
			commands::install_default_widget,
			commands::extract_widget_details,
			commands::load_json,
			commands::save_json,
			commands::create_widget_folder,
			commands::temp_copy,
			commands::save_temp_tile_icon,
			commands::delete_widget_folder,
			commands::load_system_fonts,
			commands::save_temp_widget_file,
			commands::get_secret_key,
			commands::set_secret_key,
			commands::delete_secret_key
		])
		.run(tauri::generate_context!())
		.expect("Error while running Tauri app!");
}
