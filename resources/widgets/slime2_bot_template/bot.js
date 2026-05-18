/* Globals *******************************************************************/
const slime2 = {
	getPronouns,
	getTwitchFollowDate,
};

const RequestResolveRejectMap = new Map();

const Widget = {
	values: new Map(),
};

const ReadAccount = {
	id: '',
	serviceId: '',
};

const BotAccount = {
	id: '',
	serviceId: '',
};

// set to true to automatically log event data
const USE_DETAILS_LOG = true;

// use the provided `log` function rather than `console.log`
// to log data to the bot logs, available in the widget dev tools

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
			return widgetResponseListener(event);
	}
}

function widgetButtonClickListener(event) {
	logEventDetails(event.type, event.data);

	if (event.data.id === 'button-id') {
	}
}

function widgetValuesListener(event) {
	logEventDetails(event.type, event.data);

	Widget.values = new Map(Object.entries(event.data));

	const settingValue = Widget.values.get('setting-id') ?? 'fallback-value';
}

function widgetAccountsListener(event) {
	logEventDetails(event.type, event.data);

	const [readAccount = {}, botAccount = {}] = event.data?.accounts ?? [];

	ReadAccount.id = readAccount.id ?? '';
	ReadAccount.serviceId = readAccount.serviceId ?? '';
	BotAccount.id = botAccount.id ?? '';
	BotAccount.serviceId = botAccount.serviceId ?? '';
}

function twitchEventListener(event) {
	logEventDetails(`${event.type} - ${event.data.type}`, event.data);

	const { type, data } = event.data;

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
function widgetResponseListener(event) {
	logEventDetails(`${event.type} - ${event.data.type}`, event.data);

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
	return sendRequest('post-twitch-chat-message', {
		account_id: BotAccount.id,
		broadcaster_id: ReadAccount.serviceId,
		sender_id: BotAccount.serviceId,
		message,
		reply_parent_message_id,
	});
}

/** Returns array of pronouns to show, or `null` if they haven't set any */
async function getPronouns(platform, userId, username) {
	return sendRequest('get-pronouns', {
		platform,
		user_id: userId,
		username,
	});
}

/** Returns ISO string of follow date, or `null` if they aren't following. */
async function getTwitchFollowDate(accountId, userId) {
	return sendRequest('get-twitch-follow-date', {
		account_id: accountId,
		user_id: userId,
	});
}

/* Helpers *******************************************************************/

/** Sends data back to Slime2 */
function send(type, data) {
	postMessage({ type, data });
}

/** Sends a request to Slime2, to be resolved from a slime2:response event */
async function sendRequest(type, payload) {
	const requestId = `${type}_${Date.now()}`;

	return new Promise((resolve, reject) => {
		ResolveRejectMap.set(requestId, [resolve, reject]);
		send('slime2:request', payload);
	});
}

/**
 * Log message to the Bot Log, must be JSON serializable
 *
 * level = "info" | "log" | "error" | "debug" | "warn"
 */
function log(message, level = 'log') {
	send('slime2:log', { message, level });
}

/** Log given type and data, if `USE_DETAILS_LOG = true` */
function logEventDetails(type, data) {
	if (!USE_DETAILS_LOG) return;

	log({ type, data });
}
