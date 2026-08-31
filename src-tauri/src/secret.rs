use crate::AppState;
use std::sync::Arc;
use tauri::State;

static KEYRING_SERVICE_NAME: &str = "slime2.stream";

pub fn get_secret(
	state: State<AppState>,
	key: &str,
) -> keyring::Result<String> {
	get_entry(state, key).get_password()
}

pub fn set_secret(
	state: State<AppState>,
	key: &str,
	value: &str,
) -> keyring::Result<()> {
	get_entry(state, key).set_password(value)
}

pub fn delete_secret(state: State<AppState>, key: &str) -> keyring::Result<()> {
	get_entry(state, key).delete_credential()
}

pub fn get_entry(state: State<AppState>, key: &str) -> Arc<keyring::Entry> {
	state
		.secret_entries
		.lock()
		.unwrap()
		.entry(key.to_string())
		.or_insert(Arc::new(create_entry(key)))
		.clone()
}

pub fn create_entry(key: &str) -> keyring::Entry {
	keyring::Entry::new(KEYRING_SERVICE_NAME, key).unwrap()
}
