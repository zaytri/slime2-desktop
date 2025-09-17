const Widget = {
	botAccount: {},
};

// Listeners
// ***************************************************************************

onmessage = message => {
	if (!message.data || !message.data.type || !message.data.data) return;

	const { type, data } = message.data;
	switch (type) {
		case 'slime2:widget-values':
			return widgetValuesListener(data);
		case 'slime2:widget-accounts':
			return widgetAccountsListener(data);
		case 'slime2:twitch-event':
			return twitchEventListener(data);
	}
};

function widgetValuesListener(eventDetail) {
	console.log('slime2:widget-values', eventDetail);
}

function widgetAccountsListener(eventDetail) {
	console.log('slime2:widget-accounts', eventDetail);

	const { accounts } = eventDetail;
	Widget.botAccount = accounts[1];
}

function twitchEventListener(eventDetail) {
	console.log('slime2:twitch-event', eventDetail.type, eventDetail);

	const { type, data } = eventDetail;
	switch (type) {
		case 'channel.chat.message':
			return handleChatMessage(data);
	}
}

// Event Handlers
// ***************************************************************************

function handleChatMessage(data) {
	const { broadcaster_user_id, message_id, message, chatter_user_id } = data;

	// don't respond to messages from the bot itself
	if (chatter_user_id === Widget.botAccount.serviceId) {
		return;
	}

	sendChatMessage(
		Widget.botAccount.id,
		broadcaster_user_id,
		Widget.botAccount.serviceId,
		'hewwo',
		message_id,
	);
}

// Senders
// ***************************************************************************

function sendChatMessage(
	account_id,
	broadcaster_id,
	sender_id,
	message,
	reply_parent_message_id,
) {
	postMessage({
		type: 'send-chat-message',
		data: {
			account_id,
			broadcaster_id,
			sender_id,
			message,
			reply_parent_message_id,
		},
	});
}
