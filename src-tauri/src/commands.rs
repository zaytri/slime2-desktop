//? Tauri command guide: https://tauri.app/v1/guides/features/command
// Websocket commmands found under server/websocket/ws_commands.rs

use crate::{file, server};
use chrono::Local;
use nanoid::nanoid;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{
	fs,
	io::Read,
	path::{Path, PathBuf},
};

// file_path must not include ".json" extension
#[tauri::command]
pub async fn load_json(file_path: &str) -> Result<String, String> {
	match file::load_json(PathBuf::from(file_path)) {
		Ok(json) => Ok(json),
		Err(error) => Err(format!("{}", error)),
	}
}

// file_path must not include ".json" extension
#[tauri::command]
pub async fn save_json(
	json_string: &str,
	file_path: &str,
) -> Result<(), String> {
	if let Err(error) = file::save_json(json_string, PathBuf::from(file_path)) {
		return Err(format!("{}", error));
	}

	Ok(())
}

#[tauri::command]
pub async fn send_websocket_message(
	message: &str,
	channel: &str,
	state: tauri::State<'_, server::websocket::WebsocketConnections>,
) -> Result<(), String> {
	// send message to all connections
	for (_connection_id, connection) in state.read().await.iter() {
		connection.send(message, channel);
	}
	Ok(())
}

#[tauri::command]
pub async fn copy_widget(
	widget_id: &str,
	app_handle: tauri::AppHandle,
) -> Result<String, String> {
	let new_widget_id = generate_widget_id();
	let widget_files_path = file::tiles_path(&app_handle);

	if let Err(error) = file::copy_folder(
		widget_files_path.join(widget_id),
		widget_files_path.join(new_widget_id.clone()),
	) {
		return Err(format!(
			"Failed to copy widget \"{}\": {}",
			widget_id, error
		));
	}

	Ok(new_widget_id)
}

#[tauri::command]
pub async fn create_widget_folder(
	app_handle: tauri::AppHandle,
) -> Result<String, String> {
	let new_folder_id = generate_widget_folder_id();
	let new_folder_config_path = file::tiles_path(&app_handle)
		.join(new_folder_id.clone())
		.join("config");

	let icon_file_name = match file::copy_file(
		&file::assets_path(&app_handle).join("folder.png"),
		new_folder_config_path.join("icon"),
	) {
		Ok(file_name) => file_name,
		Err(error) => {
			return Err(format!("Failed to create widget folder! {}", error))
		}
	};

	if let Err(error) = file::save_json(
		json!({
		  "name": "New Folder",
		  "color": "green",
		  "icon": format!("icon/{}", icon_file_name)
		})
		.to_string()
		.as_str(),
		new_folder_config_path.join("data"),
	) {
		return Err(format!("Failed to create widget folder! {}", error));
	}

	Ok(new_folder_id)
}

#[tauri::command]
pub async fn install_default_widget(
	widget_name: &str,
	app_handle: tauri::AppHandle,
) -> Result<String, String> {
	let new_widget_id = generate_widget_id();

	if let Err(error) = file::copy_folder(
		file::default_widget_files_path(&app_handle).join(widget_name),
		file::widget_files_core_path(&app_handle, new_widget_id.clone()),
	) {
		return Err(format!(
			"Failed to copy default widget \"{}\": {}",
			widget_name, error
		));
	}

	Ok(new_widget_id)
}

#[tauri::command]
pub async fn install_widget(
	zip_path: &str,
	app_handle: tauri::AppHandle,
) -> Result<String, String> {
	let new_widget_id = generate_widget_id();
	let source_path = Path::new(zip_path);

	let archive = match file::unzip(source_path) {
		Ok(archive) => archive,
		Err(error) => {
			return Err(format!("Failed to open zip: {}", error));
		}
	};

	if let Err(error) = file::copy_zip(
		archive,
		file::widget_files_core_path(&app_handle, new_widget_id.clone()),
	) {
		return Err(format!("Failed to copy zip contents: {}", error));
	}

	Ok(new_widget_id)
}

#[tauri::command]
pub async fn delete_widget(
	widget_id: &str,
	app_handle: tauri::AppHandle,
) -> Result<(), String> {
	let widget_path = file::tiles_path(&app_handle).join(widget_id);

	if let Err(error) = fs::remove_dir_all(widget_path) {
		return Err(format!(
			"Failed to delete widget \"{}\": {}",
			widget_id, error
		));
	}

	Ok(())
}

#[tauri::command]
pub async fn temp_copy(
	file_path: &str,
	app_handle: tauri::AppHandle,
) -> Result<String, String> {
	return match file::copy_file(
		Path::new(file_path),
		file::temp_files_path(&app_handle),
	) {
		Ok(file_name) => Ok(file_name),
		Err(error) => {
			return Err(format!(
				"Failed to copy file to temp folder! {}",
				error
			))
		}
	};
}

#[tauri::command]
pub async fn temp_delete(
	file_name: &str,
	app_handle: tauri::AppHandle,
) -> Result<(), String> {
	let path = file::temp_files_path(&app_handle).join(file_name);

	if let Err(error) = fs::remove_file(path) {
		eprintln!("Error deleting temp file \"{}\": {}", file_name, error);
		return Ok(());
	}

	Ok(())
}

#[tauri::command]
pub async fn extract_widget_details(zip_path: &str) -> Result<String, String> {
	let source_path = Path::new(zip_path);

	let mut archive = match file::unzip(source_path) {
		Ok(archive) => archive,
		Err(error) => {
			return Err(format!("Failed to open zip: {}", error));
		}
	};

	// check if config.json exists
	let Ok(mut file) = archive.by_name("config.json") else {
		return Err(String::from("File config.json not found!"));
	};

	// read config.json into a string
	let mut config_contents = String::new();
	if let Err(error) = file.read_to_string(&mut config_contents) {
		return Err(format!("Error reading config.json: {}", error));
	}

	// deserialize config.json into a Config
	let config = match serde_json::from_str::<Config>(&config_contents) {
		Ok(config) => config,
		Err(error) => {
			return Err(format!(
				"Failed to deserialize config.json into a Config: {}",
				error
			));
		}
	};

	// return widget name and author
	Ok(format!("{} by {}", config.name, config.author))
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct Config {
	name: String,
	author: String,
}

fn generate_widget_id() -> String {
	format!("widget_{}_{}", nanoid!(), Local::now().format("%Y%m%d"))
}

fn generate_widget_folder_id() -> String {
	format!("folder_{}_{}", nanoid!(), Local::now().format("%Y%m%d"))
}
