//? Tauri command guide: https://tauri.app/v1/guides/features/command
// Websocket commmands found under server/websocket/ws_commands.rs

use crate::{
	file,
	secret::{delete_secret, get_secret, set_secret},
	server,
};
use chrono::Local;
use font_kit::source::SystemSource;
use nanoid::nanoid;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{
	fs::{self, File},
	io::{Read, Write},
	path::{Path, PathBuf},
};
use tauri::AppHandle;
use walkdir::WalkDir;
use zip::write::SimpleFileOptions;

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
	app_handle: AppHandle,
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

	let new_config_path =
		file::tile_config_path(&app_handle, new_widget_id.clone());

	match file::load_json(new_config_path.join("meta")) {
		Ok(tile_meta_json) => {
			match serde_json::from_str::<file::TileMeta>(&tile_meta_json) {
				Ok(tile_meta) => {
					if let Err(error) = file::create_tile_meta(
						new_config_path,
						file::TileMeta {
							name: format!("{} (copy)", tile_meta.name),
							icon: tile_meta.icon,
							color: tile_meta.color,
						},
					) {
						return Err(format!(
							"Failed to save tile meta for widget \"{}\": {}",
							new_widget_id, error
						));
					};
				}
				Err(error) => {
					return Err(format!(
						"Failed to load tile meta for widget \"{}\": {}",
						new_widget_id, error
					));
				}
			}
		}
		Err(error) => {
			return Err(format!(
				"Failed to load tile meta for widget \"{}\": {}",
				new_widget_id, error
			));
		}
	};

	Ok(new_widget_id)
}

#[tauri::command]
pub async fn create_widget_folder(
	app_handle: AppHandle,
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
			return Err(format!("Failed to create widget folder! {}", error));
		}
	};

	let tile_meta = match serde_json::to_string_pretty(&json!({
		"name": "New Folder",
		"color": "green",
		"icon": format!("icon/{}", icon_file_name)
	})) {
		Ok(json) => json,
		Err(error) => {
			return Err(format!("Failed to create widget folder! {}", error));
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
	app_handle: AppHandle,
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
	app_handle: AppHandle,
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

	// generate widget config for icon
	if let Err(error) =
		file::generate_widget_config(&app_handle, new_widget_id.clone())
	{
		return Err(format!(
			"Failed to generate widget config for default widget \"{}\": {}",
			widget_name, error
		));
	}

	Ok(new_widget_id)
}

#[tauri::command]
pub async fn install_custom_widget(
	zip_path: &str,
	app_handle: AppHandle,
) -> Result<String, String> {
	let new_widget_id = generate_widget_id();
	let source_path = Path::new(zip_path);

	let mut archive = match file::unzip(source_path) {
		Ok(archive) => archive,
		Err(error) => {
			return Err(format!("Failed to open zip: {}", error));
		}
	};

	// check if zip contains meta.json
	if let Err(error) = archive.by_name("config\\meta.json") {
		return Err(format!("Zip file is missing config/meta.json! {}", error));
	}

	// extract zip into slime2
	if let Err(error) = file::copy_zip(
		archive,
		file::widget_files_core_path(&app_handle, new_widget_id.clone()),
	) {
		return Err(format!("Failed to copy zip contents: {}", error));
	}

	// generate widget config for icon
	if let Err(error) =
		file::generate_widget_config(&app_handle, new_widget_id.clone())
	{
		return Err(format!(
			"Failed to generate widget config for custom widget: {}",
			error
		));
	}

	Ok(new_widget_id)
}

// reference: https://github.com/zip-rs/zip2/blob/master/examples/write_dir.rs
#[tauri::command]
pub async fn package_custom_widget(
	widget_id: &str,
	zip_path: &str,
	app_handle: AppHandle,
) -> Result<String, String> {
	let source_path =
		file::widget_files_core_path(&app_handle, widget_id.to_string());

	let widget_core_iterator = WalkDir::new(source_path.clone())
		.into_iter()
		.filter_map(|entry| {
			return match entry.ok() {
				Some(entry) => {
					// filter out OS files such as .DS_Store and Thumbs.db
					if junk_file::is_junk(entry.file_name()) {
						return None;
					} else {
						return Some(entry);
					};
				}
				None => None,
			};
		});

	let destination_path = Path::new(zip_path);
	let file = match File::create(destination_path) {
		Ok(file) => file,
		Err(error) => {
			return Err(format!(
				"Failed to create destination file: {}",
				error
			));
		}
	};

	let mut zip_writer = zip::ZipWriter::new(file);
	let mut buffer = Vec::new();
	let zip_options = SimpleFileOptions::default();
	for entry in widget_core_iterator {
		let path = entry.path();
		let name = match path.strip_prefix(source_path.clone()) {
			Ok(name) => name,
			// ignore file if strip prefix fails
			Err(error) => {
				println!("Error stripping prefix: {}", error);
				continue;
			}
		};
		let path_as_string = match name.to_str() {
			Some(string) => string,
			// ignore file if not valid UTF-8
			None => {
				println!("Found path failing UTF-8 validation!");
				continue;
			}
		};

		// write file or directory explicitly
		// some unzip tools unzip files with directory paths correctly, some do not!
		if path.is_file() {
			if let Err(error) =
				zip_writer.start_file(path_as_string, zip_options)
			{
				// ignore file if starting to write fails
				println!("Error starting to write to zip: {}", error);
				if let Err(error) = zip_writer.abort_file() {
					println!("Error aborting zip write: {}", error);
				};
				continue;
			}

			let mut file = match File::open(path) {
				Ok(file) => file,
				// ignore file if it can't be opened
				Err(error) => {
					println!("Error opening file: {}", error);
					if let Err(error) = zip_writer.abort_file() {
						println!("Error aborting zip write: {}", error);
					};
					continue;
				}
			};

			if let Err(error) = file.read_to_end(&mut buffer) {
				// ignore file and clear buffer if it can't be read to end
				buffer.clear();
				println!("Error reading file: {}", error);
				if let Err(error) = zip_writer.abort_file() {
					println!("Error aborting zip write: {}", error);
				};
				continue;
			}

			if let Err(error) = zip_writer.write_all(&buffer) {
				// ignore file and clear buffer if it can't be fully written
				buffer.clear();
				println!("Error writing file: {}", error);
				if let Err(error) = zip_writer.abort_file() {
					println!("Error aborting zip write: {}", error);
				};
				continue;
			}

			buffer.clear();
		} else if !name.as_os_str().is_empty() {
			// only if not root! avoids path spec / warning
			// and mapname conversion failed error on unzip
			if let Err(error) =
				zip_writer.add_directory(path_as_string, zip_options)
			{
				println!("Error adding directory to zip: {}", error);
			};
		}
	}

	return match zip_writer.finish() {
		Ok(_) => Ok(zip_path.to_string()),
		Err(error) => Err(format!("Failed to write zip file: {}", error)),
	};
}

#[tauri::command]
pub async fn delete_widget(
	widget_id: &str,
	app_handle: AppHandle,
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
	app_handle: AppHandle,
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
			));
		}
	};
}

#[tauri::command]
pub async fn save_temp_tile_icon(
	file_name: &str,
	tile_id: &str,
	app_handle: AppHandle,
) -> Result<String, String> {
	return match file::copy_file(
		file::temp_files_path(&app_handle).join(file_name).as_path(),
		file::tiles_path(&app_handle)
			.join(tile_id)
			.join("config")
			.join("icon"),
	) {
		Ok(file_name) => Ok(file_name),
		Err(error) => {
			return Err(format!(
				"Failed to copy folder icon from temp folder! {}",
				error
			));
		}
	};
}

#[tauri::command]
pub async fn save_temp_widget_file(
	file_name: &str,
	widget_id: &str,
	app_handle: AppHandle,
) -> Result<String, String> {
	return match file::copy_file_timestamped(
		file::temp_files_path(&app_handle).join(file_name).as_path(),
		file::tiles_path(&app_handle)
			.join(widget_id)
			.join("config")
			.join("assets"),
	) {
		Ok(timestamped_file_name) => Ok(timestamped_file_name),
		Err(error) => {
			return Err(format!(
				"Failed to copy widget asset from temp folder! {}",
				error
			));
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

// thanks to https://github.com/tauri-apps/tauri/discussions/9616
#[tauri::command]
pub async fn load_system_fonts() -> Vec<String> {
	let source = SystemSource::new();
	if let Ok(fonts) = source.all_families() {
		fonts
	} else {
		vec![]
	}
}

#[tauri::command]
pub async fn get_secret_key(key: &str) -> Result<String, String> {
	return match get_secret(key) {
		Ok(entry) => Ok(entry),
		Err(error) => {
			return Err(format!(
				"Error getting secret key ({}): {}",
				key, error
			));
		}
	};
}

#[tauri::command]
pub async fn set_secret_key(key: &str, value: &str) -> Result<(), String> {
	return match set_secret(key, value) {
		Ok(()) => Ok(()),
		Err(error) => {
			return Err(format!(
				"Error setting secret key ({}): {}",
				key, error
			));
		}
	};
}

#[tauri::command]
pub async fn delete_secret_key(key: &str) -> Result<(), String> {
	return match delete_secret(key) {
		Ok(()) => Ok(()),
		Err(error) => {
			return Err(format!(
				"Error deleting secret key ({}): {}",
				key, error
			));
		}
	};
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
