//? Tauri command guide: https://tauri.app/v1/guides/features/command
// Websocket commmands found under server/websocket/ws_commands.rs

use crate::{
	file::{self, create_tile_meta, load_widget_meta, TileMeta},
	server,
};
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
// the frontend command handles pretty printing
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
		&file::assets_path(&app_handle).join(file::default_folder_image_name()),
		new_folder_config_path.join("icon"),
	) {
		Ok(file_name) => file_name,
		Err(error) => {
			return Err(format!("Failed to create widget folder! {}", error))
		}
	};

	let tile_meta = match serde_json::to_string_pretty(&json!({
		"name": "New Folder",
		"color": "green",
		"icon": format!("icon/{}", icon_file_name)
	})) {
		Ok(json) => json,
		Err(error) => {
			return Err(format!("Failed to create widget folder! {}", error))
		}
	};

	if let Err(error) =
		file::save_json(tile_meta.as_str(), new_folder_config_path.join("meta"))
	{
		return Err(format!("Failed to create widget folder! {}", error));
	}

	Ok(new_folder_id)
}

#[tauri::command]
pub async fn delete_widget_folder(
	folder_id: &str,
	app_handle: tauri::AppHandle,
) -> Result<(), String> {
	if !folder_id.starts_with("folder") {
		return Err(format!(
			"Invalid folder ID \"{}\" when trying to delete widget folder!",
			folder_id
		));
	}

	let tile_path = file::tiles_path(&app_handle).join(folder_id);

	if let Err(error) = fs::remove_dir_all(tile_path) {
		return Err(format!(
			"Failed to delete widget folder \"{}\": {}",
			folder_id, error
		));
	}

	Ok(())
}

#[tauri::command]
pub async fn install_default_widget(
	widget_name: &str,
	app_handle: tauri::AppHandle,
) -> Result<String, String> {
	let new_widget_id = generate_widget_id();
	let core_path =
		file::widget_files_core_path(&app_handle, new_widget_id.clone());

	// copy widget core files
	if let Err(error) = file::copy_folder(
		file::default_widget_files_path(&app_handle).join(widget_name),
		core_path.clone(),
	) {
		return Err(format!(
			"Failed to copy default widget \"{}\": {}",
			widget_name, error
		));
	}

	// extract tile meta from widget meta
	let meta = match load_widget_meta(core_path) {
		Ok(config) => config,
		Err(error) => {
			return Err(format!(
				"Failed to load meta.json for default widget \"{}\": {}",
				widget_name, error
			))
		}
	};

	// path to tile config folder
	let config_path =
		file::tile_config_path(&app_handle, new_widget_id.clone());

	// get icon path from widget meta, or get default icon path if empty
	let icon_source_path = if meta.icon.clone().is_empty() {
		file::assets_path(&app_handle).join(file::default_widget_image_name())
	} else {
		file::widget_files_core_path(&app_handle, new_widget_id.clone())
			.join("config")
			.join(meta.icon.clone())
	};

	// copy icon into config/icon and get the icon file name
	let icon_file_name =
		match file::copy_file(&icon_source_path, config_path.join("icon")) {
			Ok(file_name) => file_name,
			Err(error) => {
				return Err(format!(
					"Failed to copy icon file for default widget \"{}\": {}",
					widget_name, error
				))
			}
		};

	// create meta.json for the widget tile
	if let Err(error) = create_tile_meta(
		config_path,
		TileMeta {
			icon: format!("icon/{}", icon_file_name),
			..meta
		},
	) {
		return Err(format!(
			"Failed to create tile meta.json for default widget \"{}\": {}",
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
	if !widget_id.starts_with("widget") {
		return Err(format!(
			"Invalid widget ID \"{}\" when trying to delete widget!",
			widget_id
		));
	}

	let tile_path = file::tiles_path(&app_handle).join(widget_id);

	if let Err(error) = fs::remove_dir_all(tile_path) {
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
pub async fn save_temp_folder_icon(
	file_name: &str,
	folder_id: &str,
	app_handle: tauri::AppHandle,
) -> Result<String, String> {
	return match file::copy_file(
		file::temp_files_path(&app_handle).join(file_name).as_path(),
		file::tiles_path(&app_handle)
			.join(folder_id)
			.join("config")
			.join("icon"),
	) {
		Ok(file_name) => Ok(file_name),
		Err(error) => {
			return Err(format!(
				"Failed to copy folder icon from temp folder! {}",
				error
			))
		}
	};
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
