use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};
static TWITCH_WEBSOCKET_URL: &str = "slime2.stream";

pub async fn connect(twitch_read_account_id: String) {
	let (websocket_stream, response) =
		connect_async(TWITCH_WEBSOCKET_URL).await.expect(
			format!("Failed to connect to: {}", TWITCH_WEBSOCKET_URL).as_str(),
		);
}
