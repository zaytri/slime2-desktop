'use strict';

// Globals
// ***************************************************************************
/** @type {Map<String, [(value: any) => void, (reason?: any) => void]>} */
const RequestMap = new Map();

const Widget = {
	readAccount: { id: '', serviceId: '' },
	botAccount: { id: '', serviceId: '' },
	values: new Map(),
};

// Listeners
// ***************************************************************************

addEventListener('message', messageListener);
function messageListener(message) {
	if (!message || !message.data || !message.data.type || !message.data.data) {
		return;
	}

	const event = message.data;

	switch (event.type) {
		case 'slime2:widget-values':
			return widgetValuesListener(event);
		case 'slime2:widget-accounts':
			return widgetAccountsListener(event);
		case 'slime2:twitch-event':
			return twitchEventListener(event);
		case 'slime2:widget-button-click':
			return widgetButtonClickListener(event);
		case 'slime2:response':
			return responseListener(event);
	}
}

function widgetButtonClickListener(event) {
	if (event.data.id === 'button-id') {
	}
}

function widgetValuesListener(event) {
	Widget.values = new Map(Object.entries(event.data));

	const text = Widget.values.get('example-text-input') ?? '';
}

function widgetAccountsListener(event) {
	const accounts = event.data?.accounts ?? [];

	Widget.readAccount = accounts[0] ?? Widget.readAccount;
	Widget.botAccount = accounts[1] ?? Widget.botAccount;
}

function twitchEventListener(event) {
	const { type, data, mock } = event.data;

	// ignore mock events
	if (mock) return;

	// https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/
	// event.data.data = event of each of these EventSub payloads
	switch (type) {
		// chat
		case 'channel.chat.message':
		case 'channel.chat.message_delete':
		case 'channel.chat.clear':
		case 'channel.chat.clear_user_messages':
		case 'channel.chat.notification':

		// follow
		case 'channel.follow':

		// raid
		case 'channel.raid':

		// shoutout
		case 'channel.shoutout.create':

		// channel points
		case 'channel.channel_points_custom_reward_redemption.add':
		case 'channel.channel_points_automatic_reward_redemption.add':

		// hype train
		case 'channel.hype_train.begin':
		case 'channel.hype_train.progress':
		case 'channel.hype_train.end':

		// bits
		case 'channel.bits.use':
		case 'channel.cheer':
		case 'channel.custom_power_up_redemption.add':

		// ad break
		case 'channel.ad_break.begin':

		// subscriptions
		case 'channel.subscribe':
		case 'channel.subscription.gift':
		case 'channel.subscription.message':

		// polls
		case 'channel.poll.begin':
		case 'channel.poll.progress':
		case 'channel.poll.end':

		// predictions
		case 'channel.prediction.begin':
		case 'channel.prediction.progress':
		case 'channel.prediction.lock':
		case 'channel.prediction.end':

		// charity
		case 'channel.charity_campaign.donate':
		case 'channel.charity_campaign.start':
		case 'channel.charity_campaign.progress':
		case 'channel.charity_campaign.stop':

		// goal
		case 'channel.goal.begin':
		case 'channel.goal.progress':
		case 'channel.goal.end':
	}
}

// used to resolve requests that use the `sendRequest` function
function responseListener(event) {
	const { type, response, request_id } = event.data;

	// find and resolve the related promise
	const resolveReject = RequestMap.get(request_id);
	if (!resolveReject) return;

	const [resolve, reject] = resolveReject;
	if (response instanceof Object && 'error' in response) {
		reject(response.error);
	} else {
		resolve(response);
	}

	// delete the related resolver
	RequestMap.delete(request_id);
}

// Requests
// ***************************************************************************

/**
 * Sends a chat message, which can include any emote that the bot has access to.
 *
 * @param {string} message
 * @param {string} [parentMessageId] - If specified, chat message is sent as a
 *   reply to that message.
 * @returns {Promise<{
 * 	message_id: string;
 * 	is_sent: boolean;
 * 	drop_reason?: { code: string; message: string };
 * }>}
 */
async function sendChatMessage(
	message,
	parentMessageId, // optional
) {
	return sendRequest('post-twitch-chat-message', {
		account_id: Widget.botAccount.id,
		broadcaster_id: Widget.readAccount.serviceId,
		message,
		reply_parent_message_id: parentMessageId,
	});
}

// Helpers
// ***************************************************************************

/**
 * Sends a request to Slime2, resolved by `'slime2:response'` event listener
 *
 * @param {string} type - Request type
 * @param {any} payload - Request data
 */
async function sendRequest(type, payload) {
	const requestId = `${type}_${Date.now()}`;

	return new Promise((resolve, reject) => {
		RequestMap.set(requestId, [resolve, reject]);
		send('slime2:request', {
			request_id: requestId,
			request_type: type,
			payload,
		});
	});
}

/**
 * Sends data back to Slime2
 *
 * @param {string} type
 * @param {any} data
 */
function send(type, data) {
	postMessage({ type, data });
}

// Console Message Override
// ***************************************************************************

['log', 'debug', 'info', 'warn', 'error'].forEach(level => {
	const consoleFunction = console[level];
	console[level] = (...data) => {
		consoleFunction(...data);
		// forward to bot log
		send('slime2:log', { data, level });
	};
});
