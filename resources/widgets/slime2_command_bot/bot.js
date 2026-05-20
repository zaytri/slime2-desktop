/* Globals *******************************************************************/
const RequestResolveRejectMap = new Map();

// set to true to automatically log event data
const LOG_EVENT_DATA = true;

const EPOCH_DATE = new Date(0);

const Widget = {
	readAccount: { id: '', serviceId: '' },
	botAccount: { id: '', serviceId: '' },
	values: new Map(),
	messagesDeleted: new Map(),
	usersCleared: new Map(),
	lastChatClear: EPOCH_DATE,
	lastSent: new Map(),
	botMessageIds: new Set(),
};

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
		case 'slime2:response':
			return responseListener(event);
	}
}

function widgetValuesListener(event) {
	logEventData(event.type, event.data);

	Widget.values = new Map(Object.entries(event.data));
}

function widgetAccountsListener(event) {
	logEventData(event.type, event.data);

	const accounts = event.data?.accounts ?? [];

	Widget.readAccount = accounts[0] ?? Widget.readAccount;
	Widget.botAccount = accounts[1] ?? Widget.botAccount;
}

function twitchEventListener(event) {
	logEventData(`${event.type} - ${event.data.type}`, event.data);

	const eventDate = new Date(event.data.timestamp);

	const { type, data, mock } = event.data;

	// ignore mock events
	if (mock) return;

	switch (type) {
		case 'channel.chat.message':
			return handleChatMessage(data, eventDate);
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

// Event Handlers
// ***************************************************************************

async function sendReply(
	replyMessage,
	replyParentId,
	commandId,
	userId,
	eventDate,
) {
	const replyId = await sendChatMessage(replyMessage, replyParentId);
	Widget.botMessageIds.add(replyId);

	if (!Widget.lastSent.has(commandId)) {
		Widget.lastSent.set(commandId, new Map());
	}

	Widget.lastSent.get(commandId).set('global', eventDate);
	Widget.lastSent.get(commandId).set(userId, eventDate);
}

async function handleChatMessage(data, eventDate) {
	const {
		broadcaster_user_id,
		badges,
		message_id,
		message,
		chatter_user_id,
		chatter_user_name,
		chatter_user_login,
	} = data;

	const ignoreList = Widget.values.get('ignore-list') ?? [];

	if (
		// don't respond to messages that the bot had sent, to prevent loops
		Widget.botMessageIds.has(message_id) ||
		// don't respond to messages from users in the ignore list
		ignoreList.some(ignoreUser => {
			const lowerCaseIgnore = ignoreUser.toLowerCase();
			return (
				lowerCaseIgnore === chatter_user_name.toLowerCase() ||
				lowerCaseIgnore === chatter_user_login.toLowerCase()
			);
		})
	) {
		return;
	}

	const commandIds = Widget.values.get('commands-list') ?? [];
	for (const commandId of commandIds) {
		function getValue(settingId) {
			return getMultiSectionValue(commandId, settingId);
		}

		// ignore command if command has no reply
		const reply = (getValue('reply') ?? '').trim();
		if (!reply) break;

		const lastSentGlobalDate =
			Widget.lastSent.get(commandId)?.get('global') ?? EPOCH_DATE;
		const timeSinceGlobalSent =
			eventDate.getTime() - lastSentGlobalDate.getTime();

		const lastSentUserDate =
			Widget.lastSent.get(commandId)?.get(chatter_user_id) ?? EPOCH_DATE;
		const timeSinceUserSent = eventDate.getTime() - lastSentUserDate.getTime();

		const globalCooldown = getValue('global-cooldown') ?? 0;
		const userCooldown = getValue('user-cooldown') ?? 5;

		if (
			(globalCooldown > 0 && timeSinceGlobalSent < globalCooldown * 1000) ||
			(userCooldown > 0 && timeSinceUserSent < userCooldown * 1000)
		) {
			break;
		}

		const allowedRoles = getValue('allowed-roles') ?? ['everyone'];

		function badgeCheck(role, ...badgeSetIds) {
			return (
				allowedRoles.includes(role) &&
				badges.some(badge => {
					return badgeSetIds.some(setId => {
						return badge.set_id === setId;
					});
				})
			);
		}

		if (
			!allowedRoles.includes('everyone') &&
			!badgeCheck('broadcaster', 'broadcaster') &&
			!badgeCheck('mod', 'moderator', 'lead_moderator') &&
			!badgeCheck('vip', 'vip') &&
			!badgeCheck('sub', 'subscriber', 'founder') &&
			!(
				allowedRoles.includes('follower') &&
				(await followAgeCheck(
					chatter_user_id,
					getValue('follow-age') ?? 0,
					eventDate,
				))
			)
		) {
			// user did not pass allowed roles
			break;
		}

		const aliases = getValue('aliases') ?? [];
		const command = getValue('command') ?? '';
		const keywords = getValue('keywords') ?? [];
		const prefixRegexPart = stringsToRegexOr([command, ...aliases]);
		const keywordRegexPart = stringsToRegexOr(keywords);

		const regexParts = [];
		if (prefixRegexPart) regexParts.push(`^(${prefixRegexPart})`);
		if (keywordRegexPart) regexParts.push(`\b(${keywordRegexPart})\b`);

		if (regexParts.length === 0) {
			// no prefixes or keywords defined
			break;
		}

		// create case insensitive regex for checking both prefixes and keywords
		const regex = new RegExp(regexParts.join('|'), 'i');

		if (regex.test(message.text)) {
			sendReply(reply, message_id, commandId, chatter_user_id, eventDate);
			return;
		}
	}
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

/** Returns ISO string of follow date, or `null` if they aren't following. */
async function getTwitchFollowDate(userId) {
	return sendRequest(Widget.readAccount.id, 'get-twitch-follow-date', {
		user_id: userId,
	});
}

/* Helpers *******************************************************************/

/** Returns true if user passes the min follow age check */
async function followAgeCheck(userId, minHours, eventDate) {
	const followDateString = await getTwitchFollowDate(userId);
	if (!followDateString) {
		// user isn't a follower
		return false;
	}

	const followDate = new Date(followDateString);

	// follow age given in hours
	const minFollowTime = (minHours ?? 0) * 60 * 60 * 1000;
	const userFollowTime = eventDate.getTime() - followDate.getTime();

	return userFollowTime > minFollowTime;
}

/** Gets a value from within a Multi-Section */
function getMultiSectionValue(subsectionId, settingId) {
	return Widget.values.get(`${subsectionId}.${settingId}`);
}

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

function stringsToRegexOr(stringArray) {
	return stringArray
		.reduce((result, prefix) => {
			const trimmedPrefix = prefix.trim();
			if (trimmedPrefix !== '') {
				result.push(escapeRegExp(trimmedPrefix));
			}
			return result;
		}, [])
		.join('|');
}

/**
 * Escapes all characters that have special functionality in regex by inserting
 * a backslash before them
 *
 * Characters escaped: . * + ? ^ $ { } ( ) | [ ] \
 */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
