use serde::{Deserialize, Serialize};
use serde_json::Number;
use std::{
	collections::HashMap,
	fs::{self, File},
	io,
	path::{Path, PathBuf},
	time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager, path::BaseDirectory};
use zip::ZipArchive;

// file_path must not include .json
pub fn load_json(mut file_path: PathBuf) -> io::Result<String> {
	file_path.set_extension("json");

	// if json file doesn't exist, create it
	if !file_path.exists() {
		save_json("{}", file_path.clone())?;
	}

	fs::read_to_string(file_path)
}

// file_path must not include .json
// simply saves the given string as is, doesn't automatically pretty print it
pub fn save_json(json_string: &str, mut file_path: PathBuf) -> io::Result<()> {
	// create parent folder if it doesn't exist
	if let Some(parent_path) = file_path.parent() {
		if !parent_path.exists() {
			fs::create_dir_all(parent_path)?;
		}
	}

	file_path.set_extension("json");

	// write json to file
	fs::write(file_path, json_string)?;

	Ok(())
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct WidgetMetaForTileMeta {
	name: String,
	icon: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TileMeta {
	pub name: String,
	pub icon: String,
	pub color: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TileLocations {
	pub version: Number,
	pub locations: HashMap<String, TileLocation>,
}

#[allow(non_snake_case)]
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TileLocation {
	pub id: String,
	pub index: Number,
	pub folderId: String,
}

pub fn load_widget_meta(core_path: PathBuf) -> io::Result<TileMeta> {
	let json_string = load_json(core_path.join("config").join("meta"))?;

	let meta = serde_json::from_str::<WidgetMetaForTileMeta>(&json_string)?;

	let name = meta.name;
	let icon = match meta.icon {
		Some(value) => value,
		None => String::from(""),
	};

	return Ok(TileMeta {
		name,
		icon,
		color: String::from("green"),
	});
}

pub fn create_tile_meta(
	config_path: PathBuf,
	meta: TileMeta,
) -> io::Result<()> {
	save_json(
		&serde_json::to_string_pretty(&meta)?,
		config_path.join("meta"),
	)?;

	Ok(())
}

// recursively copy files from source folder to new destination folder
pub fn copy_folder(
	source_path: PathBuf,
	destination_path: PathBuf,
) -> io::Result<()> {
	fs::create_dir_all(&destination_path)?;

	for entry in fs::read_dir(source_path)? {
		let entry = entry?;
		let file_type = entry.file_type()?;
		let entry_source_path = entry.path();
		let entry_destination_path = destination_path.join(entry.file_name());

		if file_type.is_dir() {
			copy_folder(entry_source_path, entry_destination_path)?;
		} else {
			fs::copy(entry_source_path, entry_destination_path)?;
		}
	}

	Ok(())
}

// copy files from zip folder to destination folder
pub fn copy_zip(
	mut archive: ZipArchive<File>,
	destination_path: PathBuf,
) -> io::Result<()> {
	// loops through all files and folders
	// (including subfolders, no recursion needed)
	for i in 0..archive.len() {
		let mut file = archive.by_index(i)?;

		// enclosed_name() ensures that the file path is safe
		let file_path = match file.enclosed_name() {
			Some(path) => path,
			None => continue,
		};

		if file.is_dir() {
			// create destination folder if it doesn't exist
			let new_folder_path = destination_path.join(file_path);
			if !new_folder_path.exists() {
				fs::create_dir_all(new_folder_path)?;
			}
		} else {
			// check if file has a parent folder
			if let Some(parent_path) = file_path.parent() {
				// create destination parent folder if it doesn't exist
				let new_folder_path = destination_path.join(parent_path);
				if !new_folder_path.exists() {
					fs::create_dir_all(new_folder_path)?;
				}
			}

			// create new file at the destination folder
			let mut new_file = File::create(destination_path.join(file_path))?;

			// copy the contents of the zipped file to the new file
			io::copy(&mut file, &mut new_file)?;
		}
	}

	Ok(())
}

fn read_file_name(file: &Path) -> io::Result<String> {
	let Some(file_name_os_str) = file.file_name() else {
		return Err(io::Error::new(
			io::ErrorKind::Other,
			"Error reading source file name!",
		));
	};

	let Some(file_name) = file_name_os_str.to_str() else {
		return Err(io::Error::new(
			io::ErrorKind::Other,
			"Error reading source file name!",
		));
	};

	Ok(file_name.to_string())
}

pub fn copy_file(
	source_file: &Path,
	destination_folder: PathBuf,
) -> io::Result<String> {
	fs::create_dir_all(&destination_folder)?;

	let file_name = read_file_name(source_file)?;
	fs::copy(source_file, destination_folder.join(&file_name))?;

	Ok(file_name.to_string())
}

pub fn copy_file_timestamped(
	source_file: &Path,
	destination_folder: PathBuf,
) -> io::Result<String> {
	fs::create_dir_all(&destination_folder)?;

	let timestamp = match SystemTime::now().duration_since(UNIX_EPOCH) {
		Ok(time) => time.as_millis(),
		Err(_error) => 0,
	};

	let file_name = format!("{}_{}", timestamp, read_file_name(source_file)?);

	fs::copy(source_file, destination_folder.join(&file_name))?;

	Ok(file_name.to_string())
}

pub fn unzip(path: &Path) -> io::Result<ZipArchive<File>> {
	// check if the path is a file
	if !path.is_file() {
		return Err(io::Error::new(
			io::ErrorKind::Other,
			"This is not a file!",
		));
	}

	// check if the path is a zip file
	if let Some(extension) = path.extension() {
		if extension != "zip" {
			return Err(io::Error::new(
				io::ErrorKind::Other,
				"This is not a .zip file!",
			));
		}
	}

	let file = fs::File::open(path)?;
	let archive = ZipArchive::new(file)?;

	// check decompressed zip file size
	if let Some(decompressed_size) = archive.decompressed_size() {
		if decompressed_size == 0 {
			return Err(io::Error::new(
				io::ErrorKind::Other,
				"Zip file is empty!",
			));
		} else if decompressed_size > 1024 * 1024 * 1024 {
			// 1024 * 1024 * 1024 bytes = 1GB
			// widget installation zips should never be close to 1GB
			// potential malware or incorrect zip
			return Err(io::Error::new(
				io::ErrorKind::Other,
				"Contents of zip file are over 1GB!",
			));
		}
	} else {
		// might happen if it's password protected? or some other corruption
		return Err(io::Error::new(
			io::ErrorKind::Other,
			"Failed to calculate decompressed size of zip file!",
		));
	}

	Ok(archive)
}

pub fn empty_temp_folder(app: &AppHandle) -> io::Result<()> {
	let temp_folder_path = temp_files_path(app);

	if temp_folder_path.exists() {
		fs::remove_dir_all(temp_folder_path.clone())?;
		fs::create_dir(temp_folder_path)?;
	}

	Ok(())
}

// removes unknown tile folders and files from tiles directory
pub fn clean_tiles_folder(app: &AppHandle) -> io::Result<()> {
	let tile_locations_path = app
		.path()
		.resolve("config", BaseDirectory::AppConfig)
		.expect("Failed to resolve [app_data]/config!")
		.join("tile_locations");

	let tile_locations_json = load_json(tile_locations_path)?;

	let tile_locations = serde_json::from_str::<HashMap<String, TileLocation>>(
		&tile_locations_json,
	)?;

	let tiles_path = tiles_path(app);

	for entry in fs::read_dir(tiles_path)? {
		let entry = entry?;
		let file_type = entry.file_type()?;
		if file_type.is_dir() {
			if let Some(file_name) = entry.file_name().to_str() {
				if !tile_locations.contains_key(file_name) {
					fs::remove_dir_all(entry.path())?
				}
			}
		} else {
			fs::remove_file(entry.path())?
		}
	}

	Ok(())
}

// get path to widget_server folder (built by src-widget)
pub fn widget_server_path(app: &AppHandle) -> PathBuf {
	app.path()
		.resolve("widget_server", BaseDirectory::Resource)
		.expect("Failed to resolve [resource]/widget_server!")
}

// get path to tiles folder
pub fn tiles_path(app: &AppHandle) -> PathBuf {
	app.path()
		.resolve("tiles", BaseDirectory::AppData)
		.expect("Failed to resolve [app_data]/tiles!")
}

// get path to a specific tile's config folder
pub fn tile_config_path(app: &AppHandle, tile_id: String) -> PathBuf {
	tiles_path(app).join(tile_id).join("config")
}

// get path to default widgets folder
pub fn default_widget_files_path(app: &AppHandle) -> PathBuf {
	app.path()
		.resolve("widgets", BaseDirectory::Resource)
		.expect("Failed to resolve [resource]/widgets!")
}

// get path to a specific widget's core folder
pub fn widget_files_core_path(app: &AppHandle, widget_id: String) -> PathBuf {
	tiles_path(app).join(widget_id).join("core")
}

// get path to temp folder
pub fn temp_files_path(app: &AppHandle) -> PathBuf {
	app.path()
		.resolve("temp", BaseDirectory::AppData)
		.expect("Failed to resolve [app_data]/temp!")
}

pub fn assets_path(app: &AppHandle) -> PathBuf {
	app.path()
		.resolve("assets", BaseDirectory::Resource)
		.expect("Failed to resolve [resource]/assets!")
}

pub fn default_folder_image_name() -> String {
	String::from("folder.png")
}

pub fn default_widget_image_name() -> String {
	String::from("widget.png")
}
