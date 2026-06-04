use notify::{RecommendedWatcher, RecursiveMode};
use notify_debouncer_full::{DebouncedEvent, Debouncer, RecommendedCache};
use std::{ffi::OsStr, path::PathBuf, time::Duration};
use tauri::Emitter;
use tokio::sync::mpsc::{UnboundedReceiver, unbounded_channel};

use crate::get_app_handle;

fn async_watcher() -> notify::Result<(
	Debouncer<RecommendedWatcher, RecommendedCache>,
	UnboundedReceiver<Result<Vec<DebouncedEvent>, Vec<notify::Error>>>,
)> {
	let (ub_sender, ub_receiver) = unbounded_channel();

	// Automatically select the best implementation for your platform.
	// You can also access each implementation directly e.g. INotifyWatcher.
	let debounced_watcher = notify_debouncer_full::new_debouncer(
		Duration::from_secs(2),
		None,
		move |result| {
			futures::executor::block_on(async {
				ub_sender.send(result).unwrap();
			})
		},
	)?;

	Ok((debounced_watcher, ub_receiver))
}

pub async fn async_watch(watch_path: PathBuf) -> notify::Result<()> {
	let (mut watcher, mut ub_receiver) = async_watcher()?;
	let app_handle = get_app_handle();

	// Add a path to be watched. All files and directories at that path and
	// below will be monitored for changes.
	watcher.watch(watch_path.clone(), RecursiveMode::Recursive)?;

	while let Some(result) = ub_receiver.recv().await {
		match result {
			Ok(events) => {
				for event in events.iter() {
					if event.kind.is_access() || event.kind.is_other() {
						// ignore these events
						continue;
					}

					for event_path in event.paths.iter() {
						if event_path.is_dir() {
							continue;
						}

						let widget_path =
							match event_path.strip_prefix(&watch_path) {
								Ok(path) => path,
								Err(_) => continue,
							};
						let mut path_iterator = widget_path.iter();

						let tile_id = match path_iterator.next() {
							Some(os_name) => match os_name.to_str() {
								Some(name) => name,
								None => continue,
							},
							None => continue,
						};
						if !tile_id.starts_with("widget_") {
							continue;
						}

						let inner_folder = match path_iterator.next() {
							Some(name) => name,
							None => continue,
						};
						if inner_folder != OsStr::new("core") {
							continue;
						}

						log::debug!(
							"Widget Core {:?}: {:?}",
							event.kind,
							event
								.paths
								.iter()
								.map(|path| {
									let base_path = path
										.strip_prefix(&watch_path)
										.unwrap_or(path);
									base_path
										.strip_prefix(tile_id)
										.unwrap_or(base_path)
								})
								.collect::<Vec<_>>()
						);

						if let Err(error) =
							app_handle.emit("widget-core-watch", tile_id)
						{
							log::error!(
								"Error emitting widget-core-watch event: {}",
								error
							);
						}

						break;
					}
				}
			}
			Err(errors) => log::error!("Notify Watch Error! {:?}", errors),
		}
	}

	Ok(())
}
