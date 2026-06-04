//! Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::OnceLock;

use tauri::{AppHandle, Manager};
use tauri_plugin_log::{Target, TargetKind};
use time::macros::format_description;

mod commands;
mod file;
mod secret;
mod server;
mod watcher;

// thanks to https://github.com/tauri-apps/tauri/discussions/6309#discussioncomment-10295527
static APP_HANDLE: OnceLock<AppHandle> = OnceLock::new();
fn get_app_handle() -> AppHandle {
	APP_HANDLE.get().unwrap().clone()
}

static LOG_FILE_NAME: OnceLock<String> = OnceLock::new();
fn get_log_file_name() -> String {
	LOG_FILE_NAME.get().unwrap().clone()
}

#[tokio::main]
async fn main() {
	// related to this issue https://github.com/tauri-apps/tauri/issues/10749
	#[cfg(target_os = "linux")]
	unsafe {
		std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1")
	};

	let connections = server::websocket::WebsocketConnections::default();

	let app_launch_time = match time::OffsetDateTime::now_local() {
		Ok(local_time) => local_time,
		Err(_error) => {
			println!(
				"The system's UTC offset could not be determined at the given datetime, using UTC time instead."
			);
			time::OffsetDateTime::now_utc()
		}
	};

	if let Err(..) = LOG_FILE_NAME.set(format!(
		"{}{}",
		if cfg!(dev) {
			String::from("DEV")
		} else if cfg!(debug_assertions) {
			String::from("DEBUG")
		} else {
			String::from("LOG")
		},
		match app_launch_time.format(format_description!(
			"_[year]-[month]-[day]_[hour]-[minute]-[second]"
		)) {
			Ok(launch_timestamp) => launch_timestamp,
			Err(error) => {
				eprintln!("Time formatting error! {}", error);
				String::from("")
			}
		},
	)) {
		eprintln!("Error setting static log file name!");
	}

	tauri::Builder::default()
		// tauri_plugin_single_instance MUST be the first plugin to work
		.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
			// https://v2.tauri.app/plugin/single-instance/#focusing-on-new-instance
			// window label is "main", while the title is "Slime2"
			if let Some(window) = app.get_webview_window("main") {
				if let Err(error) = window.set_focus() {
					eprintln!("Failed to focus main window! {}", error);
				}
			}
		}))
		.plugin(
			tauri_plugin_log::Builder::new()
				// only log from slime2, not other rust crates
				.filter(|metadata| {
					// slime2 rust logs
					metadata.target().starts_with("slime2")
					// slime2 js console messages
						|| metadata.target().starts_with("webview")
				})
				.level(if cfg!(debug_assertions) {
					// log everything in dev and debug
					log::LevelFilter::max()
				} else {
					// log info, warn, and error in production
					log::LevelFilter::Info
				})
				.rotation_strategy(tauri_plugin_log::RotationStrategy::KeepOne)
				.format(|callback, message, record| {
					callback.finish(format_args!(
						"{}[{}] [{}] {}",
						match tauri_plugin_log::TimezoneStrategy::UseLocal
							.get_now()
							.format(format_description!(
								"[[[year]-[month]-[day] [hour]:[minute]:[second]] "
							)) {
							Ok(log_timestamp) => log_timestamp,
							Err(error) => {
								eprintln!("Time formatting error! {}", error);
								String::from("")
							}
						},
						record.level(),
						if record.target().starts_with("webview") {
							String::from("web:console")
						} else {
							format!("rust:{}", record.target())
						},
						message
					));
				})
				.targets([
					// send to stdout
					#[cfg(debug_assertions)] // only on dev/debug
					Target::new(TargetKind::Stdout).filter(|metadata| {
						// only log info, debug, and trace from slime2 rust to stdout
						metadata.target().starts_with("slime2")
							&& (metadata.level() > log::LevelFilter::Warn)
					}),
					// send to stderr
					#[cfg(debug_assertions)] // only on dev/debug
					Target::new(TargetKind::Stderr).filter(|metadata| {
						// only log warn and error to stderr
						metadata.level() <= log::LevelFilter::Warn
					}),
					// send to webview console
					#[cfg(debug_assertions)] // only on dev/debug
					Target::new(TargetKind::Webview).format(
						|callback, message, _record| {
							callback.finish(format_args!(
								":SLIME2RUSTLOGGER:{}",
								message
							));
						},
					),
					// send to log file
					Target::new(TargetKind::LogDir {
						file_name: Some(get_log_file_name()),
					}),
				])
				.build(),
		)
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_clipboard_manager::init())
		.plugin(tauri_plugin_opener::init())
		.manage(connections.clone())
		.setup(|app: &mut tauri::App| {
			log::info!("Welcome to Slime2!");

			let app_handle = app.app_handle().clone();

			if let Err(..) = APP_HANDLE.set(app_handle.clone()) {
				log::error!("Error setting static app handle!");
			}

			// empty temp folder on startup
			if let Err(error) = file::empty_temp_folder(&app_handle) {
				log::error!("Error emptying temp folder! {}", error);
			}

			// clean tiles folder on startup
			if let Err(error) = file::clean_tiles_folder(&app_handle) {
				log::error!("Error cleaning tiles folder! {}", error);
			}

			server::setup(
				connections,
				(
					file::overlay_server_path(&app_handle),
					file::tiles_path(&app_handle),
					file::temp_files_path(&app_handle),
				),
			)?;

			let watch_path = file::tiles_path(&app_handle);
			tokio::task::spawn(watcher::async_watch(watch_path));

			Ok(())
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
			commands::delete_secret_key,
			commands::package_custom_widget,
			commands::save_temp_widget_core_icon,
			commands::reveal_log_file
		])
		.run(tauri::generate_context!())
		.expect("Error while running Tauri app!");
}
