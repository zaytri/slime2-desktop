use std::{
	fs::{self, File},
	io,
	path::{Path, PathBuf},
};
use tauri::{path::BaseDirectory, AppHandle, Manager};
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

pub fn copy_file(
	source_file: &Path,
	destination_folder: PathBuf,
) -> io::Result<String> {
	fs::create_dir_all(&destination_folder)?;

	let Some(file_name_os_str) = source_file.file_name() else {
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

	fs::copy(source_file, destination_folder.join(file_name))?;

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
