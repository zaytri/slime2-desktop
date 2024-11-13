//? Custom slime2 websocket commands
// Tauri commands found under commands.rs

use super::{WebsocketConnection, WebsocketConnections};
use futures::stream::SplitSink;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use warp::filters::ws::{Message, WebSocket};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Command {
	pub r#type: String,
	pub data: CommandData,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum CommandData {
	Register(RegisterData),
	Test, // TEMPORARY
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RegisterData {
	id: String,
	channels: HashSet<String>,
}

pub async fn register(
	data: CommandData,
	connection_id: usize,
	websocket_sender: SplitSink<WebSocket, Message>,
	connections: &WebsocketConnections,
) -> Result<(), String> {
	let CommandData::Register(data) = data else {
		// unexpected registration data
		return Err(String::from("Register command is incorrectly formatted!"));
	};

	let mut channels: HashSet<String> = HashSet::new();

	// prefix channel names to prevent collision with widget_id channel
	for channel in data.channels.iter() {
		channels.insert(format!("channel_{}", channel));
	}

	// add widget id as a channel for widget-specific data
	channels.insert(format!("widget_{}", data.id));

	// register connection, can now send websocket messages to this connection
	connections.write().await.insert(
		connection_id,
		WebsocketConnection::new(websocket_sender, channels),
	);

	Ok(())
}
