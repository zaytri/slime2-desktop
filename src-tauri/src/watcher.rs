use notify::{ReadDirectoryChangesWatcher, RecursiveMode};
use notify_debouncer_full::{DebouncedEvent, Debouncer, FileIdMap};
use std::{ffi::OsStr, path::PathBuf, time::Duration};
use tauri::Emitter;
use tokio::sync::mpsc::{UnboundedReceiver, unbounded_channel};

use crate::get_app_handle;

fn async_watcher() -> notify::Result<(
	Debouncer<ReadDirectoryChangesWatcher, FileIdMap>,
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
				events.iter().for_each(|event| {
					if event.kind.is_create()
						|| event.kind.is_modify()
						|| event.kind.is_remove()
					{
						event.paths.iter().for_each(|event_path| {
							if let Ok(widget_path) =
								event_path.strip_prefix(&watch_path)
							{
								let mut path_iterator = widget_path.iter();
								if let Some(tile_id) = path_iterator.next() {
									if let Some(inner_folder) =
										path_iterator.next()
									{
										if inner_folder == OsStr::new("core") {
											if let Some(tile_id_str) =
												tile_id.to_str()
											{
												if tile_id_str
													.starts_with("widget_")
												{
													if let Err(error) =
														app_handle.emit(
															"widget-core-watch",
															tile_id_str,
														) {
														log::error!(
															"Error emitting widget-core-watch event: {}",
															error
														);
													}
												}
											}
										}
									}
								}
							};
						});
					}
				});
			}
			Err(errors) => log::error!("Notify Watch Error! {:?}", errors),
		}
	}

	Ok(())
}
