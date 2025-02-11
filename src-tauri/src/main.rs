//! Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod file;
mod server;

#[tokio::main]
async fn main() {
	let connections = server::websocket::WebsocketConnections::default();

	if cfg!(dev) {
		eprintln!("Welcome to slime2!");
	}

	tauri::Builder::default()
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_clipboard_manager::init())
		.plugin(tauri_plugin_dialog::init())
		.manage(connections.clone())
		.setup(|app| {
			let app_handle = app.handle();

			// empty temp folder on startup
			if let Err(error) = file::empty_temp_folder(app_handle) {
				eprintln!("Error emptying temp folder! {}", error);
			}

			server::setup(
				connections,
				(
					file::widget_server_path(app_handle),
					file::tiles_path(app_handle),
					file::temp_files_path(app_handle),
				),
			)
		})
		.invoke_handler(tauri::generate_handler![
			commands::send_websocket_message,
			commands::copy_widget,
			commands::delete_widget,
			commands::install_widget,
			commands::install_default_widget,
			commands::extract_widget_details,
			commands::load_json,
			commands::save_json,
			commands::create_widget_folder,
			commands::temp_copy,
			commands::save_temp_folder_icon,
			commands::delete_widget_folder,
		])
		.run(tauri::generate_context!())
		.expect("Error while running Tauri app!");
}
