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
	version: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TileMeta {
	pub name: String,
	pub icon: String,
	pub color: String,
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

	return Ok(TileMeta {
		name: format!("{} v{}", meta.name, meta.version),
		icon: String::from("icon/icon.png"),
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

pub fn copy_file_to_folder(
	source_file: &Path,
	destination_folder: PathBuf,
) -> io::Result<String> {
	fs::create_dir_all(&destination_folder)?;

	let file_name = read_file_name(source_file)?;
	fs::copy(source_file, destination_folder.join(&file_name))?;

	Ok(file_name.to_string())
}

fn safe_destination_path(
	source_file: &Path,
	destination_folder: PathBuf,
) -> io::Result<PathBuf> {
	let destination_path =
		destination_folder.join(read_file_name(source_file)?);

	if !destination_path.exists() {
		return Ok(destination_path);
	}

	let file_stem = destination_path
		.file_stem()
		.expect("File to copy has no file name!")
		.to_str()
		.expect("Failed to convert OsStr to str!");
	let extension_option = destination_path.extension().clone();

	// file already exists, attempt to append (#) to it

	// destination file already exists, append (#) to the name
	for index in 1..10 {
		let file_name = format!("{} ({})", file_stem, index);
		let mut numbered_destination_path = destination_folder.join(file_name);

		if let Some(extension) = extension_option {
			numbered_destination_path.set_extension(extension);
		}

		if !numbered_destination_path.exists() {
			log::debug!(
				"File already exists, returning numbered path {:?}",
				numbered_destination_path
			);
			// doesn't exist, safe to copy now
			return Ok(numbered_destination_path);
		}
	}

	// somehow all file name iterations of (1) - (10) exist, append timestamp
	let timestamp = SystemTime::now()
		.duration_since(UNIX_EPOCH)
		.map_or(0, |time| time.as_secs());
	let file_name = format!("{} ({})", file_stem, timestamp);
	let mut timestamped_destination_path = destination_folder.join(file_name);

	if let Some(extension) = extension_option {
		timestamped_destination_path.set_extension(extension);
	}

	log::debug!(
		"File already exists, numbers exhausted, returning timestamped path {:?}",
		timestamped_destination_path
	);

	// if it somehow still exists, don't care, just going to overwrite
	Ok(timestamped_destination_path)
}

/** Copies a file, appending (#) if the destination file already exists */
pub fn copy_file_safe(
	source_file: &Path,
	destination_folder: PathBuf,
) -> io::Result<String> {
	fs::create_dir_all(&destination_folder)?;
	let destination_path =
		safe_destination_path(source_file, destination_folder)?;

	fs::copy(source_file, &destination_path)?;

	Ok(destination_path
		.file_name()
		.expect("Somehow destination file has no file name?")
		.to_str()
		.expect("Failed to convert OsStr to str!")
		.to_string())
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

pub fn generate_widget_config(
	app: &AppHandle,
	widget_id: String,
) -> io::Result<()> {
	let core_path = widget_files_core_path(app, widget_id.clone());

	// extract tile meta from widget meta
	let meta = load_widget_meta(core_path)?;

	// path to tile config folder
	let config_path = tile_config_path(app, widget_id.clone());

	// path to core icon
	let core_icon_path = widget_files_core_path(app, widget_id.clone())
		.join("config")
		.join("icon.png");

	// path to tile icon folder
	let destination_folder_path = config_path.join("icon");

	// copy icon into config/icon and get the icon file name
	let icon_file_name = match copy_file_to_folder(
		&core_icon_path,
		destination_folder_path.clone(),
	) {
		Ok(file_name) => Ok(file_name),
		Err(_error) => {
			// on error, fallback to default widget icon
			let default_icon_path =
				resource_assets_path(app).join(default_widget_image_name());

			copy_file_to_folder(&default_icon_path, destination_folder_path)
		}
	}?;

	// create meta.json for the widget tile
	create_tile_meta(
		config_path,
		TileMeta {
			icon: format!("icon/{}", icon_file_name),
			..meta
		},
	)?;

	Ok(())
}

// get path to overlay_server folder (built by src-overlay)
pub fn overlay_server_path(app: &AppHandle) -> PathBuf {
	app.path()
		.resolve("overlay_server", BaseDirectory::Resource)
		.expect("Failed to resolve [resource]/overlay_server!")
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

// get path to media folder
pub fn media_files_path(app: &AppHandle) -> PathBuf {
	app.path()
		.resolve("media", BaseDirectory::AppData)
		.expect("Failed to resolve [app_data]/media!")
}

pub fn resource_assets_path(app: &AppHandle) -> PathBuf {
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
