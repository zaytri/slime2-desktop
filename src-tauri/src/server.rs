use std::path::PathBuf;
use warp::Filter;
pub mod websocket;

pub fn setup(
	connections: websocket::WebsocketConnections,
	(widget_server_path, tiles_path, temp_files_path): (
		PathBuf,
		PathBuf,
		PathBuf,
	),
) -> Result<(), Box<(dyn std::error::Error + 'static)>> {
	// home route that just returns the word "squish" for fun
	let home_route = warp::path::end().map(|| "squish");

	let widget_server_route =
		warp::path("widget").and(warp::fs::dir(widget_server_path));

	// allows widget server to access tile files
	let tiles_route = warp::path("tile").and(warp::fs::dir(tiles_path));

	// used to preview media files in the temp folder for file input
	let preview_route =
		warp::path("preview").and(warp::fs::dir(temp_files_path));

	let websocket_route = warp::path("websocket")
		.and(warp::ws())
		.and(warp::any().map(move || connections.clone()))
		.map(
			|websocket: warp::ws::Ws,
			 connections: websocket::WebsocketConnections| {
				websocket.on_upgrade(move |websocket| {
					websocket::connect(websocket, connections)
				})
			},
		);

	if cfg!(dev) {
		// no need to run widget server in dev here
		// that's run from src-widget directly
		let routes = home_route
			.or(tiles_route)
			.or(websocket_route)
			.or(preview_route)
			// allow any origin for all so that widget server can access it
			.with(warp::cors().allow_any_origin());

		// port 57140 in dev
		// widget server running on port 57141
		tauri::async_runtime::spawn(
			warp::serve(routes).run(([127, 0, 0, 1], 57140)),
		);
	} else {
		let routes = home_route
			.or(widget_server_route)
			.or(tiles_route)
			.or(preview_route)
			// allow any origin just for the websocket route
			// this allows external applications to use it
			.or(websocket_route.with(warp::cors().allow_any_origin()));

		// port 57143 in production, widget server running on the same port
		// 57143 kind of looks like slime :3c
		tauri::async_runtime::spawn(
			warp::serve(routes).run(([127, 0, 0, 1], 57143)),
		);
	}

	Ok(())
}
