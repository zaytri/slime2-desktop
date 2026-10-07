use tauri::AppHandle;

const EMPTY_JSON: &str = "{}";

pub mod account;

pub async fn setup(app: &AppHandle) {
	account::load_accounts(app).await;
}
