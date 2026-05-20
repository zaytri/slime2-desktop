/* Globals *******************************************************************/
const RequestResolveRejectMap = new Map();

const Widget = {
	readAccount: { id: '', serviceId: '' },
	botAccount: { id: '', serviceId: '' },
	values: new Map(),
};

// set to true to automatically log event data
const LOG_EVENT_DATA = true;

/*
 * Use the provided `log` function rather than `console.log`
 * to log data to the bot logs, available in the widget dev tools
 */

/* Listeners *****************************************************************/

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
	logEventData(event.type, event.data);

	if (event.data.id === 'button-id') {
	}
}

function widgetValuesListener(event) {
	logEventData(event.type, event.data);

	Widget.values = new Map(Object.entries(event.data));

	const settingValue = Widget.values.get('setting-id') ?? 'fallback-value';
}

function widgetAccountsListener(event) {
	logEventData(event.type, event.data);

	const accounts = event.data?.accounts ?? [];

	Widget.readAccount = accounts[0] ?? Widget.readAccount;
	Widget.botAccount = accounts[1] ?? Widget.botAccount;
}

function twitchEventListener(event) {
	logEventData(`${event.type} - ${event.data.type}`, event.data);

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
	logEventData(`${event.type} - ${event.data.type}`, event.data);

	const { type, response, request_id } = event.data;

	// find and resolve the related promise
	const resolveReject = RequestResolveRejectMap.get(request_id);
	if (!resolveReject) return;

	const [resolve, reject] = resolveReject;
	if (response instanceof Object && 'error' in response) {
		reject(response.error);
	} else {
		resolve(response);
	}

	// delete the related resolver
	RequestResolveRejectMap.delete(request_id);
}

/* Requests ******************************************************************/

/** Message can include any emote that the bot has access to. */
async function sendChatMessage(
	message,
	reply_parent_message_id, // optional
) {
	return sendRequest(Widget.botAccount.id, 'post-twitch-chat-message', {
		broadcaster_id: Widget.readAccount.serviceId,
		message,
		reply_parent_message_id,
	});
}

/* Helpers *******************************************************************/

/** Sends data back to Slime2 */
function send(type, data) {
	postMessage({ type, data });
}

/** Sends a request to Slime2, to be resolved from a slime2:response event */
async function sendRequest(accountId, type, payload) {
	const requestId = `${type}_${Date.now()}`;

	return new Promise((resolve, reject) => {
		RequestResolveRejectMap.set(requestId, [resolve, reject]);
		send('slime2:request', {
			account_id: accountId,
			request_id: requestId,
			request_type: type,
			payload,
		});
	});
}

/**
 * Log message to the Bot Log, must be JSON serializable
 *
 * Level = "info" | "log" | "error" | "debug" | "warn"
 */
function log(message, level = 'log') {
	send('slime2:log', { message, level });
}

/** Log given type and data, if `LOG_EVENT_DATA = true` */
function logEventData(type, data) {
	if (!LOG_EVENT_DATA) return;

	log({ type, data }, 'info');
}
