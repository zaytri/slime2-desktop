//? Custom slime2 websocket commands
// Tauri commands found under commands.rs

use crate::get_app_handle;

use super::{WebsocketConnection, WebsocketConnections};
use futures::stream::SplitSink;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use tauri::Emitter;
use warp::filters::ws::{Message, WebSocket};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Command {
	pub r#type: String,
	pub data: CommandData,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(untagged)]
pub enum CommandData {
	Register(RegisterData),
	Request(RequestData),
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RegisterData {
	id: String,
	channels: HashSet<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RequestData {
	widget_id: String,
	request_id: String,
	request_type: String,
	payload: HashMap<String, String>,
}

#[derive(Clone, Serialize)]
struct RegisterPayload {
	id: String,
}

pub async fn register(
	command_data: CommandData,
	connection_id: usize,
	websocket_sender: SplitSink<WebSocket, Message>,
	connections: &WebsocketConnections,
) -> Result<(), String> {
	let CommandData::Register(register_data) = command_data else {
		// unexpected registration data
		return Err(String::from("Register command is incorrectly formatted!"));
	};

	let mut channels: HashSet<String> = HashSet::new();

	// prefix channel names to prevent collision with widget_id channel
	for channel in register_data.channels.iter() {
		channels.insert(format!("channel_{}", channel));
	}

	// add widget id as a channel for widget-specific data
	channels.insert(format!("widget_{}", register_data.id));

	if let Err(error) = get_app_handle().emit(
		"widget-registration",
		RegisterPayload {
			id: register_data.id,
		},
	) {
		return Err(format!(
			"Error emitting widget-registration event: {}",
			error
		));
	};

	// register connection, can now send websocket messages to this connection
	connections.write().await.insert(
		connection_id,
		WebsocketConnection::new(websocket_sender, channels),
	);

	Ok(())
}

pub fn request(command_data: CommandData) -> Result<(), String> {
	let CommandData::Request(request_data) = command_data else {
		return Err(String::from("Request command is incorrectly formatted!"));
	};

	if let Err(error) = get_app_handle().emit("widget-request", request_data) {
		return Err(format!("Error emitting widget-request event: {}", error));
	}

	Ok(())
}
