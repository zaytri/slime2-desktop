use crate::AppState;
use keyring_core::Entry;
use std::sync::Arc;
use tauri::State;

static KEYRING_SERVICE_NAME: &str = "slime2.stream";

pub fn get_secret(
	state: State<AppState>,
	key: &str,
) -> keyring_core::Result<String> {
	get_entry(state, key).get_password()
}

pub fn set_secret(
	state: State<AppState>,
	key: &str,
	value: &str,
) -> keyring_core::Result<()> {
	get_entry(state, key).set_password(value)
}

pub fn delete_secret(
	state: State<AppState>,
	key: &str,
) -> keyring_core::Result<()> {
	get_entry(state, key).delete_credential()
}

pub fn get_entry(state: State<AppState>, key: &str) -> Arc<Entry> {
	state
		.secret_entries
		.lock()
		.unwrap()
		.entry(key.to_string())
		.or_insert(Arc::new(create_entry(key)))
		.clone()
}

pub fn create_entry(key: &str) -> keyring_core::Entry {
	#[cfg(target_os = "windows")]
	{
		Entry::new_with_modifiers(
			KEYRING_SERVICE_NAME,
			key,
			&std::collections::HashMap::from([("persistence", "Local")]),
		)
		.unwrap()
	}

	#[cfg(not(target_os = "windows"))]
	Entry::new(KEYRING_SERVICE_NAME, key).unwrap()
}
