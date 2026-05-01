const Widget = {
	values: {},
	botAccount: {},
};

// Message Receivers
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

function widgetValuesListener(messageData) {
	console.log('slime2:widget-values', messageData);

	Widget.values = messageData;
}

function widgetAccountsListener(messageData) {
	console.log('slime2:widget-accounts', messageData);

	const { accounts } = messageData;
	Widget.botAccount = accounts[1];
}

function twitchEventListener(messageData) {
	console.log('slime2:twitch-event', messageData.type, messageData);

	// ignore mock events
	// if (messageData.mock) return;

	const { type, data } = messageData;
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

	Widget.values['basic-commands'].forEach(id => {
		const command = Widget.values[`${id}.command`].toLowerCase();
		const aliases = Widget.values[`${id}.aliases`];
		const response = Widget.values[`${id}.response`];

		for (const alias of [command, ...aliases]) {
			if (message.text.toLowerCase().startsWith(alias.toLowerCase())) {
				sendChatMessage(
					response,
					{
						slime2_account_id: Widget.botAccount.id,
						twitch_broadcaster_id: broadcaster_user_id,
						twitch_bot_id: Widget.botAccount.serviceId,
					},
					message_id,
				);
				break;
			}
		}
	});
}

// Message Senders
// ***************************************************************************

function sendChatMessage(
	message,
	accounts,
	reply_parent_message_id, // optional
) {
	const { slime2_account_id, twitch_broadcaster_id, twitch_bot_id } = accounts;

	send('send-chat-message', {
		account_id: slime2_account_id,
		broadcaster_id: twitch_broadcaster_id,
		sender_id: twitch_bot_id,
		message,
		reply_parent_message_id,
	});
}

function send(type, data) {
	postMessage({ type, data });
}
