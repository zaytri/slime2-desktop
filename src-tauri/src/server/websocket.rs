use futures::{stream::SplitSink, SinkExt, StreamExt, TryFutureExt};
use std::{
	collections::{HashMap, HashSet},
	sync::{
		atomic::{AtomicUsize, Ordering},
		Arc,
	},
};
use tokio::sync::{mpsc, RwLock};
use warp::filters::ws::{Message, WebSocket};
mod ws_commands;

static NEXT_CONNECTION_ID: AtomicUsize = AtomicUsize::new(1);

pub type WebsocketConnections =
	Arc<RwLock<HashMap<usize, WebsocketConnection>>>;

pub struct WebsocketConnection {
	sender: mpsc::UnboundedSender<Message>,
	channels: HashSet<String>,
}

impl WebsocketConnection {
	fn new(
		mut websocket_sender: SplitSink<WebSocket, Message>,
		channels: HashSet<String>,
	) -> WebsocketConnection {
		// use an unbounded channel to handle buffering and flushing of messages to the websocket
		// don't know if this is even necessary but might as well have it
		let (ub_sender, mut ub_receiver) = mpsc::unbounded_channel();

		// when a message is sent to the unbounded receiver, send it to the websocket
		tokio::task::spawn(async move {
			while let Some(message) = ub_receiver.recv().await {
				websocket_sender
					.send(message)
					.unwrap_or_else(|error| {
						eprintln!("Websocket Send Error: {}", error)
					})
					.await
			}
		});

		WebsocketConnection {
			sender: ub_sender,
			channels,
		}
	}

	/// Sends `message` to the connected client if `channel` is registered, or if `channel == "all"`.
	pub fn send(&self, message: &str, channel: &str) {
		// only send if the channel is a registered channel or "all"
		if channel == "all" || self.channels.contains(channel) {
			if let Err(_disconnected) = self.sender.send(Message::text(message))
			{
				// sender is disconnected, our `disconnected` code should be happening
				// in another task, nothing more to do here.
			}
		}
	}
}

pub async fn connect(websocket: WebSocket, connections: WebsocketConnections) {
	// use a counter to assign a new unique ID for this connection
	let connection_id = NEXT_CONNECTION_ID.fetch_add(1, Ordering::Relaxed);
	if cfg!(dev) {
		eprintln!("New Websocket Connection (ID: {})", connection_id)
	}

	if let Err(error) =
		message_handler(websocket, &connections, connection_id).await
	{
		if cfg!(dev) {
			eprintln!("{}", error);
		}
	}

	disconnect(connection_id, &connections).await;
}

fn get_command(
	message_result: Result<Message, warp::Error>,
) -> Result<ws_commands::Command, String> {
	match message_result {
		Ok(message) => {
			let Ok(message_text) = message.to_str() else {
				// message is not a text string
				return Err(String::from("Message is not a Text message!"));
			};

			let command = match serde_json::from_str::<ws_commands::Command>(
				message_text,
			) {
				Ok(command) => command,
				// text cannot be deserialized into a Command
				Err(error) => {
					return Err(format!(
						"Failed to deserialize Message into a Command: {}",
						error
					));
				}
			};

			Ok(command)
		}
		Err(error) => Err(error.to_string()),
	}
}

// returns early on any error, to immediately disconnect the websocket
async fn message_handler(
	websocket: WebSocket,
	connections: &WebsocketConnections,
	connection_id: usize,
) -> Result<(), String> {
	// split the websocket into a sender and receiver of messages
	let (websocket_sender, mut websocket_receiver) = websocket.split();

	// check if the first incoming message is a Register Command
	if let Some(result) = websocket_receiver.next().await {
		let command = match get_command(result) {
			Ok(command) => command,
			Err(error) => {
				// error occured while converting into command
				return Err(format!(
					"Websocket Error (ID: {}): {}",
					connection_id, error
				));
			}
		};

		if command.r#type != "register" {
			return Err(format!(
				"First message from (ID: {}) is not a register command!",
				connection_id
			));
		}

		// handle registration
		if let Err(error) = ws_commands::register(
			command.data,
			connection_id,
			websocket_sender,
			connections,
		)
		.await
		{
			return Err(format!(
				"Error from (ID: {}): {}",
				connection_id, error
			));
		}
	}

	// handle all other incoming messages
	while let Some(result) = websocket_receiver.next().await {
		let command = match get_command(result) {
			Ok(command) => command,
			Err(error) => {
				// error occured while converting into command
				return Err(format!(
					"Websocket Error (ID: {}): {}",
					connection_id, error
				));
			}
		};

		// command handling
		match command.r#type.as_str() {
			"test" => {}
			"register" => {
				// not allowed to register more than once
				return Err(format!(
					"Connection (ID: {}) attempted to register twice!",
					connection_id
				));
			}
			_ => {
				return Err(format!(
					"Connection (ID: {}) sent an unexpected command type!",
					connection_id
				));
			}
		}
	}

	Ok(())
}

async fn disconnect(connection_id: usize, connections: &WebsocketConnections) {
	// stream closed, remove from connections list
	connections.write().await.remove(&connection_id);

	if cfg!(dev) {
		eprintln!("Disconnected Websocket (ID: {})", connection_id)
	}
}
