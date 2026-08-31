use crate::{
	AppState,
	file::{config_path, load_json},
	get_app_handle,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::Manager;

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Account {
	id: String,
	service_id: String,
	service: AccountService,
	username: String,
	display_name: String,
	image: String,
	scopes: Vec<String>,
	r#type: AccountType,
	reauthorize: bool,
	// keys are widget IDs, values are indices
	#[serde(default)]
	widgets: HashMap<String, u8>,
	default: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "lowercase")]
enum AccountService {
	Twitch,
	Youtube,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "lowercase")]
enum AccountType {
	Read,
	Bot,
	Mod,
}

pub async fn get_accounts() {
	let app_handle = get_app_handle();
	let path = config_path(app_handle).join("accounts");
	let json = load_json(path).unwrap();
	app_handle
		.state::<AppState>()
		.accounts
		.write()
		.unwrap()
		.extend(
			serde_json::from_str::<HashMap<String, Account>>(&json).unwrap(),
		);
}
