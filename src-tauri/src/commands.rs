//? Tauri command guide: https://tauri.app/v1/guides/features/command
// Websocket commmands found under server/websocket/ws_commands.rs

use crate::{
	file, get_log_file_name,
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
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;
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

	// all this just to add (copy) to the name of the new widget
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
	folder_name: &str,
	color: &str,
	app_handle: AppHandle,
) -> Result<String, String> {
	let new_folder_id = generate_widget_folder_id();
	let new_folder_config_path = file::tiles_path(&app_handle)
		.join(new_folder_id.clone())
		.join("config");

	let icon_file_name = match file::copy_file_to_folder(
		&file::assets_path(&app_handle).join(file::default_folder_image_name()),
		new_folder_config_path.join("icon"),
	) {
		Ok(file_name) => file_name,
		Err(error) => {
			return Err(format!("Failed to create widget folder! {}", error));
		}
	};

	let tile_meta = match serde_json::to_string_pretty(&json!({
		"name": folder_name,
		"color": color,
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

	let archive = match file::unzip(source_path) {
		Ok(archive) => archive,
		Err(error) => {
			return Err(format!("Failed to open zip: {}", error));
		}
	};

	// check if zip contains meta.json
	if let Err(_) =
		file::extract_file_from_zip(source_path, "config\\meta.json")
	{
		if let Err(error) =
			file::extract_file_from_zip(source_path, "config/meta.json")
		{
			return Err(format!(
				"Zip file is missing config/meta.json! {}",
				error
			));
		}
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
				log::error!("Error stripping prefix: {}", error);
				continue;
			}
		};
		let path_as_string = match name.to_str() {
			Some(string) => string,
			// ignore file if not valid UTF-8
			None => {
				log::error!("Found path failing UTF-8 validation!");
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
				log::error!("Error starting to write to zip: {}", error);
				if let Err(error) = zip_writer.abort_file() {
					log::error!("Error aborting zip write: {}", error);
				};
				continue;
			}

			let mut file = match File::open(path) {
				Ok(file) => file,
				// ignore file if it can't be opened
				Err(error) => {
					log::error!("Error opening file: {}", error);
					if let Err(error) = zip_writer.abort_file() {
						log::error!("Error aborting zip write: {}", error);
					};
					continue;
				}
			};

			if let Err(error) = file.read_to_end(&mut buffer) {
				// ignore file and clear buffer if it can't be read to end
				buffer.clear();
				log::error!("Error reading file: {}", error);
				if let Err(error) = zip_writer.abort_file() {
					log::error!("Error aborting zip write: {}", error);
				};
				continue;
			}

			if let Err(error) = zip_writer.write_all(&buffer) {
				// ignore file and clear buffer if it can't be fully written
				buffer.clear();
				log::error!("Error writing file: {}", error);
				if let Err(error) = zip_writer.abort_file() {
					log::error!("Error aborting zip write: {}", error);
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
				log::error!("Error adding directory to zip: {}", error);
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
	return match file::copy_file_to_folder(
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
	return match file::copy_file_to_folder(
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
pub async fn save_temp_widget_core_icon(
	file_name: &str,
	widget_id: &str,
	app_handle: AppHandle,
) -> Result<String, String> {
	// overwrite instead of copying to a folder like the other ones
	return match fs::copy(
		file::temp_files_path(&app_handle).join(file_name).as_path(),
		file::tiles_path(&app_handle)
			.join(widget_id)
			.join("core")
			.join("config")
			.join("icon")
			.with_extension("png"),
	) {
		Ok(_bytes) => Ok(String::from("icon.png")),
		Err(error) => {
			return Err(format!(
				"Failed to copy widget core icon from temp folder! {}",
				error
			));
		}
	};
}

#[tauri::command]
pub async fn extract_widget_details(zip_path: &str) -> Result<String, String> {
	let source_path = Path::new(zip_path);

	// if zip was created in windows, uses \ for separator, otherwise / in unix
	match file::extract_file_from_zip(source_path, "config\\meta.json") {
		Ok(file_contents) => return Ok(file_contents),
		Err(_) => {
			match file::extract_file_from_zip(source_path, "config/meta.json") {
				Ok(file_contents) => return Ok(file_contents),
				Err(error) => {
					return Err(format!("File meta.json not found! {}", error));
				}
			};
		}
	};
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FontData {
	pub postscript_name: String,
	pub full_name: String,
	pub family_name: String,
	pub is_monospace: bool,
	pub properties: FontProperties,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FontProperties {
	pub style: String,
	pub weight: f32,
	pub stretch: f32,
}

#[tauri::command]
pub async fn load_system_fonts() -> Vec<FontData> {
	let source = SystemSource::new();
	if let Ok(font_handles) = source.all_fonts() {
		let mut fonts: Vec<FontData> = Vec::new();

		for font_handle in font_handles {
			if let Ok(font) = font_handle.load() {
				let properties = font.properties();

				if let Some(postscript_name) = font.postscript_name() {
					fonts.push(FontData {
						postscript_name,
						full_name: font.full_name(),
						family_name: font.family_name(),
						is_monospace: font.is_monospace(),
						properties: FontProperties {
							style: properties.style.to_string(),
							weight: properties.weight.0,
							stretch: properties.stretch.0,
						},
					});
				}
			}
		}

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

#[tauri::command]
pub async fn reveal_log_file(app_handle: AppHandle) -> Result<(), String> {
	let log_file_path = app_handle
		.path()
		.resolve(
			format!("{}.log", get_log_file_name()),
			tauri::path::BaseDirectory::AppLog,
		)
		.expect("Failed to resolve path to log file!");

	return match app_handle.opener().reveal_item_in_dir(log_file_path) {
		Ok(()) => Ok(()),
		Err(error) => {
			return Err(format!("Error revealing log file {}", error));
		}
	};
}

fn generate_widget_id() -> String {
	format!("widget_{}_{}", nanoid!(), Local::now().format("%Y%m%d"))
}

fn generate_widget_folder_id() -> String {
	format!("folder_{}_{}", nanoid!(), Local::now().format("%Y%m%d"))
}
