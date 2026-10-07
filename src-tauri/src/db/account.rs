use crate::{
	AppState,
	db::EMPTY_JSON,
	file::{config_path, load_json, queue_save_json},
	get_app_handle, get_app_state,
	secret::get_secret,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{AppHandle, Manager};

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

pub fn load_accounts() {
	let app_handle = get_app_handle();
	let app_state = get_app_state();
	let path = config_path(app_handle).join("accounts");
	let json_string = load_json(path).unwrap_or(EMPTY_JSON.to_string());
	match serde_json::from_str::<HashMap<String, Account>>(&json_string) {
		Ok(accounts_json) => {
			app_state.accounts.write().unwrap().extend(accounts_json);
		}
		Err(error) => {
			log::error!("Error loading accounts: {}", error);
		}
	}
}

pub fn save_accounts() {
	let app_handle = get_app_handle();
	let app_state = get_app_state();
	let accounts = app_state.accounts.read().unwrap().clone();
	match serde_json::to_string(&accounts) {
		Ok(json_string) => queue_save_json(
			json_string,
			config_path(app_handle).join("accounts"),
		),
		Err(error) => {
			log::error!("Unable to convert accounts to JSON string! {}", error);
		}
	};
}

pub async fn get_tokens(account_id: String) {
	let app_state = get_app_state();
	let secret = get_secret(app_state, &account_id);
}
