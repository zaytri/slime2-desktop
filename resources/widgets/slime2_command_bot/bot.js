// Globals
// ***************************************************************************
const RequestResolveRejectMap = new Map();

// set to true to automatically log event data
const LOG_EVENT_DATA = true;

const EPOCH_DATE = new Date(0);

const Widget = {
	readAccount: { id: '', serviceId: '' },
	botAccount: { id: '', serviceId: '' },
	/** @type {Map<string, any>} */
	values: new Map(),

	/** @type {Set<string>} */
	messagesDeleted: new Set(),

	/** @type {Map<string, Date>} */
	usersCleared: new Map(),

	lastChatClear: EPOCH_DATE,

	/** @type {Map<string, Map<string, Date>>} */
	lastSent: new Map(),

	/** @type {Set<string>} */
	botMessageIds: new Set(),

	/** @type {Map<string, Promise<void>>} */
	replyPromises: new Map(),
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

		// used to ensure that deleted messages aren't replied to
		case 'channel.chat.message_delete':
			return handleChatMessageDelete(data);
		case 'channel.chat.clear':
			return handleChatClear(eventDate);
		case 'channel.chat.clear_user_messages':
			return handleChatClearUserMessages(data, eventDate);
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

// Twitch Event Handlers
// ***************************************************************************

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

	// wait for previous bot replies to be processed
	// ensures that Widget.botMessageIds is accurate
	await Promise.allSettled([...Widget.replyPromises.values()]);
	if (Widget.botMessageIds.has(message_id)) {
		// don't respond to messages that the bot had sent, to prevent bot loops
		return;
	}

	const ignoreList = Widget.values.get('ignore-list') ?? [];
	if (
		ignoreList.some(ignoreUser => {
			// user display name and username can be different, so check both
			// https://blog.twitch.tv/en/2016/08/22/localized-display-names-e00ee8d3250a/
			return [chatter_user_name, chatter_user_login].some(user => {
				return ignoreUser.toLowerCase() === user.toLowerCase();
			});
		})
	) {
		// ignore messages from users in the ignore list
		return;
	}

	/** @type {string | null | undefined} */
	let userFollowDateString = undefined;

	const commandIds = Widget.values.get('commands-list') ?? [];
	for (const commandId of commandIds) {
		/** @param {string} settingId */
		function getValue(settingId) {
			return getMultiSectionValue(commandId, settingId);
		}

		const reply = (getValue('reply') ?? '').trim();
		if (!reply) {
			// ignore command if it has no reply
			break;
		}

		const aliases = getValue('aliases') ?? [];
		const command = getValue('command') ?? '';
		const keywords = getValue('keywords') ?? [];

		if (!hasCommand(message.text, [command, ...aliases], keywords)) {
			// message doesn't contain any command words
			break;
		}

		const globalCooldown = getValue('global-cooldown') ?? 0;
		if (onCooldown(eventDate, commandId, 'global', globalCooldown)) {
			// global cooldown active
			breka;
		}

		const userCooldown = getValue('user-cooldown') ?? 5;
		if (onCooldown(eventDate, commandId, chatter_user_id, userCooldown)) {
			// user cooldown active
			break;
		}

		// check allowed roles

		const allowedRoles = getValue('allowed-roles') ?? ['everyone'];

		function badgeRoleCheck(role, ...badgeSetIds) {
			return allowedRoles.includes(role) && hasBadge(badges, ...badgeSetIds);
		}

		if (
			!allowedRoles.includes('everyone') &&
			!badgeRoleCheck('broadcaster', 'broadcaster') &&
			!badgeRoleCheck('mod', 'moderator', 'lead_moderator') &&
			!badgeRoleCheck('vip', 'vip') &&
			!badgeRoleCheck('sub', 'subscriber', 'founder')
		) {
			// user did not pass badge roles

			if (!allowedRoles.includes('follower')) {
				break;
			}

			if (userFollowDateString === undefined) {
				// cache for the other command checks
				userFollowDateString = await getTwitchFollowDate(userId);
			}

			const minFollowHours = getValue('follow-age') ?? 0;
			if (!followAgeCheck(userFollowDateString, eventDate, minFollowHours)) {
				// user did not pass follow age check
				break;
			}
		}

		if (
			// chat cleared
			eventDate < Widget.lastChatClear ||
			// message deleted
			Widget.messagesDeleted.has(message_id) ||
			// user banned or timed out
			eventDate < (Widget.usersCleared.get(chatter_user_id) ?? EPOCH_DATE)
		) {
			// if message was already deleted by the above checks,
			// don't reply and skip processing of other commands
			return;
		}

		// all checks passed

		// set last sent map for this command if it doesn't already exist
		if (!Widget.lastSent.has(commandId)) {
			Widget.lastSent.set(commandId, new Map());
		}

		// set global and user last sent dates for cooldown checks
		Widget.lastSent.get(commandId).set('global', eventDate);
		Widget.lastSent.get(commandId).set(chatter_user_id, eventDate);

		// send reply and skip processing of other commands
		sendReply(reply, message_id);
		return;
	}
}

function handleChatMessageDelete(data) {
	const { message_id } = data;
	Widget.messagesDeleted.add(message_id);
}

function handleChatClear(eventDate) {
	Widget.lastChatClear = eventDate;
}

function handleChatClearUserMessages(data, eventDate) {
	const { target_user_id } = data;
	Widget.usersCleared.set(target_user_id, eventDate);
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
	return sendRequest(Widget.botAccount.id, 'post-twitch-chat-message', {
		broadcaster_id: Widget.readAccount.serviceId,
		message,
		reply_parent_message_id: parentMessageId,
	});
}

/**
 * Returns ISO string of follow date, or `null` if they aren't following.
 *
 * @param {string} userId
 * @returns {Promise<null | string>}
 */
async function getTwitchFollowDate(userId) {
	return sendRequest(Widget.readAccount.id, 'get-twitch-follow-date', {
		user_id: userId,
	});
}

// Helpers
// ***************************************************************************

/**
 * Returns `true` if the message contains the provided prefixes or keywords.
 *
 * @param {string} message
 * @param {string[]} prefixes
 * @param {string[]} keywords
 * @returns {boolean}
 */
function hasCommand(messageText, prefixes, keywords) {
	const prefixRegexPart = stringsToRegexOr(prefixes);
	const keywordRegexPart = stringsToRegexOr(keywords);

	const regexParts = [];

	if (prefixRegexPart) {
		// ^ matches start of string, \b is word boundary
		regexParts.push(String.raw`^(${prefixRegexPart})\b`);
	}

	if (keywordRegexPart) {
		// \b is word boundary
		regexParts.push(String.raw`\b(${keywordRegexPart})\b`);
	}

	if (regexParts.length === 0) {
		// no prefixes or keywords defined
		return false;
	}

	// case insensitive regex for checking both prefixes and keywords
	const regex = new RegExp(regexParts.join('|'), 'i');

	return regex.test(messageText);
}

/**
 * Returns true if the given `eventDate` is within the command's cooldown.
 *
 * @param {Date} eventDate - Message Date
 * @param {string} commandId - Command reference
 * @param {string} cooldownId - `"global"` or user ID
 * @param {number} cooldownSeconds - Cooldown amount in seconds
 * @returns {boolean}
 */
function onCooldown(eventDate, commandId, cooldownId, cooldownSeconds) {
	if (cooldownSeconds === 0) {
		// no cooldown
		return false;
	}

	const lastSentDate =
		Widget.lastSent.get(commandId)?.get(cooldownId) ?? EPOCH_DATE;

	const timeSinceLastSent = eventDate.getTime() - lastSentDate.getTime();

	return timeSinceLastSent < cooldownSeconds * 1000;
}

/**
 * Returns `true` if the Badges contain at least one of the Badge Set IDs.
 *
 * @param {{
 * 	set_id: string;
 * 	id: string;
 * 	info: string;
 * }[]} badges
 * @param {...string} badgeSetIds
 * @returns {boolean}
 */
function hasBadge(badges, ...badgeSetIds) {
	return badges.some(badge => {
		return badgeSetIds.some(setId => {
			return badge.set_id === setId;
		});
	});
}

/**
 * Returns `true` if the difference between the `followDateString` and
 * `eventDate` is greater than `minFollowHours`.
 *
 * @param {string | null} followDateString - From {@link getTwitchFollowDate}
 * @param {Date} eventDate
 * @param {number} minFollowHours
 * @returns {boolean}
 */
function followAgeCheck(followDateString, eventDate, minFollowHours) {
	if (!followDateString) {
		// user is not a follower
		return false;
	}

	const followDate = new Date(followDateString);
	const minFollowTime = minFollowHours * 60 * 60 * 1000;
	const userFollowTime = eventDate.getTime() - followDate.getTime();

	return userFollowTime > minFollowHours;
}

/**
 * Sends a chat message as a reply.
 *
 * @param {string} replyMessage
 * @param {string} parentMessageId
 */
function sendReply(replyMessage, parentMessageId) {
	const promiseId = `${parentMessageId}_${Date.now()}`;

	const replyPromise = async () => {
		try {
			const response = await sendChatMessage(replyMessage, parentMessageId);
			const botMessageId = response.message_id;
			// save botMessageId to ensure that the bot ignores
			// messages that it had sent through this widget
			Widget.botMessageIds.add(botMessageId);
		} finally {
			// promise settled, delete from external map
			Widget.replyPromises.delete(promiseId);
		}
	};

	// add promise to external map
	Widget.replyPromises.set(promiseId, replyPromise);
	replyPromise();
}

/**
 * Gets a value from within a Multi-Section
 *
 * @param {string} subsectionId
 * @param {string} settingId
 */
function getMultiSectionValue(subsectionId, settingId) {
	return Widget.values.get(`${subsectionId}.${settingId}`);
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

/**
 * Sends a request to Slime2, resolved by `'slime2:response'` event listener
 *
 * @param {string} accountId - Account used for the request
 * @param {string} type - Request type
 * @param {any} payload - Request data
 */
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
 * Given a string array, joins them in a regex OR.
 *
 * The strings are trimmed, discarding empty ones, and regex escaped.
 *
 * @param {string[]} stringArray
 * @returns {string}
 */
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
 *
 * @param {string} string
 * @returns {string}
 */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Log given type and data, if `LOG_EVENT_DATA = true`
 *
 * @param {string} type
 * @param {any} data
 */
function logEventData(type, data) {
	if (!LOG_EVENT_DATA) return;

	console.info(type, data);
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
