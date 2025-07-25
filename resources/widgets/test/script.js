/* Globals *******************************************************************/
const slime2 = /** @type {Slime2} */ (window.slime2);

const Widget = {};

const messagesDeleted = new Map();
const usersCleared = new Map();
const EPOCH = new Date(0);
let lastChatClear = EPOCH;

if (!!window.obsstudio) {
	document.body.style.setProperty('background-color', 'transparent');
}

/** Listeners */

addEventListener('slime2:widget-values', event => {
	console.log(event);
});

addEventListener('slime2:widget-accounts', event => {
	Widget.badges = event.detail[0].badges;
});

addEventListener('slime2:twitch-event', async event => {
	if (
		!event.detail ||
		!event.detail.type ||
		!event.detail.data ||
		!event.detail.account_id ||
		!event.detail.timestamp
	) {
		return;
	}

	const timestamp = new Date(event.timestamp);

	console.log(event.detail.type, event.detail.data);

	const { type, data } = event.detail;

	switch (type) {
		case 'channel.chat.message':
			return handleChatMessage(data, timestamp);
		case 'channel.chat.message_delete':
			return handleChatMessageDelete(data);
		case 'channel.chat.clear':
			return handleChatClear(timestamp);
		case 'channel.chat.clear_user_messages':
			return handleChatClearUserMessages(data, timestamp);
	}
});

/** Event Handlers */
async function handleChatMessage(data, timestamp) {
	const {
		message,
		chatter_user_name,
		chatter_user_login,
		chatter_user_id,
		message_id,
		color,
	} = data;
	const pronouns = await slime2.getPronouns(
		'twitch',
		chatter_user_id,
		chatter_user_login,
	);

	const messageTemplateClone = cloneTemplate('message-template');
	const messageElement = messageTemplateClone.querySelector('.message');
	messageElement.setAttribute('data-message-id', message_id);
	messageElement.setAttribute('data-user-id', chatter_user_id);
	messageElement.style.setProperty('--userColor', color);

	messageTemplateClone
		.querySelector('.user')
		.appendChild(
			buildUser(chatter_user_name, chatter_user_login, pronouns, badges),
		);

	const contentElement = messageTemplateClone.querySelector('.content');
	message.fragments.forEach(fragment => {
		contentElement.append(buildMessageFragment(fragment));
	});

	const widgetBody = document.getElementById('widget');

	if (
		// chat cleared
		timestamp < lastChatClear ||
		// message deleted
		messagesDeleted.get(message_id) ||
		// user banned or timed out
		timestamp < (usersCleared.get(chatter_user_id) ?? EPOCH)
	) {
		console.log('deleted??');
		// if message was already deleted by the above checks, don't render
		return;
	}

	widgetBody.appendChild(messageTemplateClone);
}

async function handleChatMessageDelete(data) {
	const { message_id } = data;
	messagesDeleted.set(message_id, true);
	document
		.getElementById('widget')
		.querySelectorAll(`[data-message-id='${message_id}']`)
		.forEach(element => element.remove());
}

async function handleChatClear(timestamp) {
	lastChatClear = timestamp;
	document
		.getElementById('widget')
		.querySelectorAll('.message')
		.forEach(element => element.remove());
}

async function handleChatClearUserMessages(data, timestamp) {
	const { target_user_id } = data;
	usersCleared.set(target_user_id, timestamp);
	document
		.getElementById('widget')
		.querySelectorAll(`[data-user-id='${target_user_id}']`)
		.forEach(element => element.remove());
}

/** Element Builders */

/**
 * @param {string} displayName
 * @param {string} username
 * @param {string[] | null} pronouns
 * @param {Twitch.Badge[]} badges
 * @returns {DocumentFragment}
 */
function buildUser(displayName, username, pronouns, badges) {
	const userClone = cloneTemplate('user-template');

	let name = displayName;

	// https://blog.twitch.tv/en/2016/08/22/localized-display-names-e00ee8d3250a/
	if (displayName.toLowerCase() !== username.toLowerCase()) {
		name = `${name} (${username})`; // localized display name
	}

	userClone.querySelector('.name').textContent = name;
	userClone.querySelector('.name').setAttribute('data-content', name);

	if (pronouns) {
		userClone.querySelector('.pronouns').textContent = pronouns.join('/');
	}

	userClone.querySelector('.badges').append(buildBadges(badges));

	return userClone;
}

/**
 * @param {Twitch.Badge[]} badges
 * @returns {DocumentFragment}
 */
function buildBadges(badges) {
	return badges.map(userBadge => {
		const badgeSetData = Widget.badges.find(
			badge => badge.set_id === userBadge.set_id,
		);
		const badgeData = badgeSetData.versions.find(
			version => version.id === userBadge.id,
		);
		const image = badgeData.image_url_4x;

		const badgeClone = cloneTemplate('badge-template');
		badgeClone.querySelector('.badge').setAttribute('src', image);

		return badgeClone;
	});
}

/**
 * @param {MessageFragment} fragment
 * @returns {DocumentFragment}
 */
function buildMessageFragment(fragment) {
	switch (fragment.type) {
		case 'emote':
			return buildEmoteFragment(fragment);
		case 'mention':
			return buildMentionFragment(fragment);
		case 'cheermote':
		case 'text':
		default:
			return buildTextFragment(fragment);
	}
}

/**
 * @param {TextFragment} textFragment
 * @returns {DocumentFragment}
 */
function buildTextFragment(textFragment) {
	const { text } = textFragment;

	const textClone = cloneTemplate('text-fragment-template');
	textClone.querySelector('.text').textContent = text;

	return textClone;
}

/**
 * @param {MentionFragment} mentionFragment
 * @returns {DocumentFragment}
 */
function buildMentionFragment(mentionFragment) {
	const { mention } = mentionFragment;

	const mentionClone = cloneTemplate('mention-fragment-template');
	mentionClone.querySelector('.mention').textContent = `@${mention.user_login}`;

	return mentionClone;
}

/**
 * @param {Twitch.EmoteFragment} emoteFragment
 * @returns {DocumentFragment}
 */
function buildEmoteFragment(emoteFragment) {
	const { emote } = emoteFragment;

	const emoteClone = cloneTemplate('emote-fragment-template');
	emoteClone.querySelector('.emote').src = buildTwitchEmoteImageUrl(emote.id);

	return emoteClone;
}

/** Helpers */

/**
 * Builds Twitch emote image URL given the emote ID
 *
 * @typedef {Object} EmoteOptions
 * @property {'default' | 'static' | 'animated'} [animation]
 * @property {'light' | 'dark'} [background]
 * @property {'1.0' | '2.0' | '3.0'} [size]
 * @param {string} id
 * @param {EmoteOptions} options
 */
function buildTwitchEmoteImageUrl(id, options = {}) {
	const { animation = 'default', background = 'dark', size = '3.0' } = options;

	return `https://static-cdn.jtvnw.net/emoticons/v2/${id}/${animation}/${background}/${size}`;
}

/**
 * Given the ID of an HTML template, returns the cloned contents
 *
 * @param {string} id
 * @returns {DocumentFragment}
 */
function cloneTemplate(id) {
	const element = document.getElementById(id);

	if (!element) {
		throw Error(`Template with id "${id}" not found!`);
	}

	if (element.tagName !== 'TEMPLATE') {
		throw Error(`Element with id "${id}" is not a template!`);
	}

	return element.content.cloneNode(true);
}

/* Type Definitions **********************************************************/

/**
 * The slime2 global variable.
 *
 * @typedef {object} Slime2
 * @property {(
 * 	platform: 'twitch',
 * 	userId: string,
 * 	username: string,
 * ) => Promise<string[] | null>} getPronouns
 */

/**
 * Twitch Event, identified by type and version.
 *
 * @typedef {Twitch.Event.Common &
 * 	(
 * 		| {
 * 				type: 'channel.bits.use';
 * 				version: '1';
 * 				data: Twitch.Event.BitsUse;
 * 		  }
 * 		| {
 * 				type: 'channel.follow';
 * 				version: '2';
 * 				data: Twitch.Event.Follow;
 * 		  }
 * 		| {
 * 				type: 'channel.ad_break.begin';
 * 				version: '1';
 * 				data: Twitch.Event.AdBreakBegin;
 * 		  }
 * 		| {
 * 				type: 'channel.chat.message';
 * 				version: '1';
 * 				data: Twitch.Event.ChatMessage;
 * 		  }
 * 		| {
 * 				type: 'channel.chat.clear_user_messages';
 * 				version: '1';
 * 				data: Twitch.Event.ChatClearUserMessages;
 * 		  }
 * 		| {
 * 				type: 'channel.chat.message_delete';
 * 				version: '1';
 * 				data: Twitch.Event.ChatMessageDelete;
 * 		  }
 * 	)} Twitch.Event
 */

/**
 * @typedef {object} Twitch.Event.Common
 * @property {string} id - ID of the event
 * @property {string} account_id - ID of the account that recieved the event
 * @property {string} timestamp - Date time in ISO 8601 format
 */

/**
 * Twitch Channel Bits Use Event.
 *
 * Sent when bits are used on the channel.
 *
 * @typedef {object} Twitch.Event.BitsUse
 * @property {string} broadcaster_user_id - ID of the broadcaster.
 * @property {string} broadcaster_user_login - Username of the broadcaster.
 * @property {string} broadcaster_user_name - Display name of the broadcaster.
 * @property {string} user_id - ID of the redeeming user.
 * @property {string} user_login - Username of the redeeming user.
 * @property {string} user_name - Display name fo the redeeming user.
 * @property {number} bits - Number of bits used.
 * @property {'cheer' | 'power_up'} type - Type of bit redeem.
 * @property {object} [message] - Optional. Used when type is 'cheer' or when
 *   the 'power_up' type is 'message_effect'
 */

/**
 * Twitch Channel Follow Event.
 *
 * Sent when the channel receives a follow.
 *
 * @typedef {object} Twitch.Event.Follow
 * @property {string} broadcaster_user_id - ID of the broadcaster.
 * @property {string} broadcaster_user_login - Username of the broadcaster.
 * @property {string} broadcaster_user_name - Display name of the broadcaster.
 * @property {string} user_id - ID of the follower.
 * @property {string} user_login - Username of the follower.
 * @property {string} user_name - Display name of the follower.
 * @property {string} followed_at - RFC3339 timestamp of when the follow
 *   occurred.
 */

/**
 * Twitch Channel Ad Break Begin Event.
 *
 * Sent when a user runs a midroll commercial break, either manually or
 * automatically via ads manager.
 *
 * @typedef {object} Twitch.Event.AdBreakBegin
 * @property {string} broadcaster_user_id - ID of the broadcaster.
 * @property {string} broadcaster_user_login - Username of the broadcaster.
 * @property {string} broadcaster_user_name - Display name of the broadcaster.
 * @property {string} requester_user_id - ID of the user that requested the ad.
 *   For automatic ads, this will be the ID of the broadcaster.
 * @property {string} requester_user_login - Username of the requester.
 * @property {string} requester_user_name - Display name of the requester.
 * @property {integer} duration_seconds - Length in seconds of the ad break.
 * @property {string} started_at - RFC3339 timestamp of when the ad break began.
 *   Note that there is potential delay between this event, when the streamer
 *   requested the ad break, and when the viewers will see ads.
 * @property {boolean} is_automatic - If auto-scheduled via the Ads Manager.
 */

/**
 * Twitch Channel Chat Clear Event.
 *
 * Sent when a moderator or bot clears all messages from the chat room.
 *
 * @typedef {object} Twitch.Event.ChatClear
 * @property {string} broadcaster_user_id - ID of the broadcaster.
 * @property {string} broadcaster_user_login - Username of the broadcaster.
 * @property {string} broadcaster_user_name - Display name of the broadcaster.
 */

/**
 * Twitch Channel Chat Clear User Messages Event.
 *
 * Sent when a moderator or bot clears all messages for a specific user (either
 * by putting them in timeout or banning them).
 *
 * @typedef {object} Twitch.Event.ChatClearUserMessages
 * @property {string} broadcaster_user_id - ID of the broadcaster.
 * @property {string} broadcaster_user_login - Username of the broadcaster.
 * @property {string} broadcaster_user_name - Display name of the broadcaster.
 * @property {string} target_user_id - ID of the user that was banned or put in
 *   timeout. All of their messages are deleted.
 * @property {string} target_user_login - Username of the target.
 * @property {string} target_user_name - Display name of the target.
 */

/**
 * Twitch Channel Chat Message Event.
 *
 * Sent when any user sends a message to the channel's chat room.
 *
 * @typedef {object} Twitch.Event.ChatMessage
 * @property {string} broadcaster_user_id - ID of the broadcaster.
 * @property {string} broadcaster_user_login - Username of the broadcaster.
 * @property {string} broadcaster_user_name - Display name of the broadcaster.
 * @property {string} chatter_user_id - ID of the user that sent the message.
 * @property {string} chatter_user_name - Display name of the chatter.
 * @property {string} chatter_user_login - Username of the chatter.
 * @property {string} message_id - ID of the message.
 * @property {Twitch.MessageWithFragments} message - Structured chat message.
 * @property {'text'
 * 	| 'channel_points_highlighted'
 * 	| 'channel_points_sub_only'
 * 	| 'user_intro'
 * 	| 'power_ups_message_effect'
 * 	| 'power_ups_gigantified_emote'} message_type
 *   - Type of message.
 *
 * @property {Twitch.Badge[]} badges - List of chat badges.
 * @property {object} [cheer] - Optional. Metadata if this message is a cheer.
 * @property {number} cheer.bits - Amount of bits the user cheered.
 * @property {string} [color] - Color of the user's name in the chat room, as a
 *   CSS hex code. This may be empty if they never set a color.
 * @property {object} [reply] - Optional. Metadata if this message is a reply.
 * @property {string} reply.parent_message_id - ID of the parent message that
 *   this message is replying to.
 * @property {string} reply.parent_message_body - Message body of the parent
 *   message.
 * @property {string} reply.parent_user_id - ID of the sender of the parent
 *   message.
 * @property {string} reply.parent_user_name - Display name of the sender of the
 *   parent message.
 * @property {string} reply.parent_user_login - Username of the sender of the
 *   parent message.
 * @property {string} reply.thread_message_id - ID of the first message of the
 *   reply thread.
 * @property {string} reply.thread_user_id - ID of the sender of the thread's
 *   first message.
 * @property {string} reply.thread_user_name - Display name of the sender of the
 *   thread's first message.
 * @property {string} reply.thread_user_login - Username of the sender of the
 *   thread's first message.
 * @property {string} [channel_points_custom_reward_id] - Optional. The ID of
 *   the channel points custom reward that was redeemed.
 * @property {string} [source_broadcaster_user_id] - Optional. The user name of
 *   the broadcaster of the channel the message was sent from. Is null when the
 *   message happens in the same channel as the broadcaster. Is not null when in
 *   a shared chat session, and the action happens in the channel of a
 *   participant other than the broadcaster.
 * @property {string} [source_broadcaster_user_name] - Optional. The display of
 *   the broadcaster of the channel the message was sent from. Is null when the
 *   message happens in the same channel as the broadcaster. Is not null when in
 *   a shared chat session, and the action happens in the channel of a
 *   participant other than the broadcaster.
 * @property {string} [source_broadcaster_user_login] - Optional. The username
 *   of the broadcaster of the channel the message was sent from. Is null when
 *   the message happens in the same channel as the broadcaster. Is not null
 *   when in a shared chat session, and the action happens in the channel of a
 *   participant other than the broadcaster.
 * @property {string} [source_message_id] - Optional. The UUID that identifies
 *   the source message from the channel the message was sent from. Is null when
 *   the message happens in the same channel as the broadcaster. Is not null
 *   when in a shared chat session, and the action happens in the channel of a
 *   participant other than the broadcaster.
 * @property {Twitch.Badge[]} [source_badges] - Optional. The list of chat
 *   badges for the chatter in the channel the message was sent from. Is null
 *   when the message happens in the same channel as the broadcaster. Is not
 *   null when in a shared chat session, and the action happens in the channel
 *   of a participant other than the broadcaster.
 * @property {boolean} [is_source_only] - Optional. Determines if a message
 *   delivered during a shared chat session is only sent to the source channel.
 *   Has no effect if the message is not sent during a shared chat session.
 */

/**
 * Twitch Channel Chat Message Delete Event.
 *
 * Sent when a moderator or bot removes a specific message.
 *
 * @typedef {object} Twitch.Event.ChatMessageDelete
 * @property {string} broadcaster_user_id - ID of the broadcaster.
 * @property {string} broadcaster_user_login - Username of the broadcaster.
 * @property {string} broadcaster_user_name - Display name of the broadcaster.
 * @property {string} target_user_id - ID of the user whose message was deleted.
 * @property {string} target_user_login - Username of the target.
 * @property {string} target_user_name - Display name of the target.
 * @property {string} message_id - ID of the message that was deleted.
 */

/**
 * Twitch Channel Chat Notification Event.
 *
 * Sent when an event that appears in chat occurs, such as someone subscribing
 * to the channel or an announcement.
 *
 * @typedef {object} Twitch.Event.ChatNotification
 * @property {string} broadcaster_user_id - ID of the broadcaster.
 * @property {string} broadcaster_user_login - Username of the broadcaster.
 * @property {string} broadcaster_user_name - Display name of the broadcaster.
 * @property {string} chatter_user_id - ID of the user that sent the message.
 * @property {string} chatter_user_name - Username of the chatter.
 * @property {boolean} chatter_is_anonymous - If the chatter is anonymous.
 * @property {string} color - The color of the chatter's name.
 * @property {Twitch.Badge[]} badges - List of chat badges.
 * @property {string} system_message - The message Twitch shows in the chat room
 *   for this notice.
 * @property {string} message_id - ID of the message.
 * @property {Twitch.MessageWithFragments} message - Structured chat message.
 */

/** Twitch Helper Types */

/**
 * @typedef {object} Twitch.Badge
 * @property {string} set_id - ID that identifies this set of chat badges. For
 *   example, Bits or Subscriber.
 * @property {string} id - An ID that identifies this version of the badge. The
 *   ID can be any value. For example, for bits, the ID is the bits tier level,
 *   but for World of Warcraft, it could be Alliance or Horde.
 * @property {string} info - Contains metadata related to the chat badges in the
 *   badges tag. Currently, this tag contains metadata only for subscriber
 *   badges, to indicate the number of months the user has been a subscriber.
 *
 * @typedef {object} Twitch.MessageWithFragments
 * @property {string} text - Chat message in plain text.
 * @property {Twitch.MessageFragment[]} fragments - Ordered list of chat message
 *   fragments.
 *
 * @typedef {Twitch.TextFragment
 * 	| Twitch.EmoteFragment
 * 	| Twitch.CheermoteFragment
 * 	| Twitch.MentionFragment} Twitch.MessageFragment
 *
 *
 * @typedef {object} Twitch.TextFragment
 * @property {'text'} type - Type of message fragment.
 * @property {string} text - Message text in fragment.
 *
 * @typedef {object} Twitch.EmoteFragment
 * @property {'emote'} type - Type of message fragment.
 * @property {string} text - Message text in fragment.
 * @property {object} emote - Metadata pertaining to the emote.
 * @property {string} emote.id - ID that uniquely identifies this emote.
 * @property {string} emote.emote_set_id - ID of this emote's emote set.
 * @property {string} emote.owner_id - ID of the broadcaster with this emote.
 * @property {('static' | 'animated')[]} emote.format - The formats that the
 *   emote is available in. For example, if the emote is available only as a
 *   static PNG, the array contains only 'static'. But if the emote is available
 *   as a static PNG and an animated GIF, the array contains 'static' and
 *   'animated'.
 *
 * @typedef {object} Twitch.CheermoteFragment
 * @property {'cheermote'} type - Type of message fragment.
 * @property {string} text - Message text in fragment.
 * @property {object} cheermote - Metadata pertaining to the cheermote.
 * @property {string} cheermote.prefix - The name portion of the cheermote
 *   string that you use in chat to cheer bits. The full cheermote string is the
 *   concatenation of {prefix} + {number of bits}. For example, if the prefix is
 *   “Cheer” and you want to cheer 100 bits, the full cheermote string is
 *   Cheer100. When the cheermote string is entered in chat, Twitch converts it
 *   to the image associated with the bits tier that was cheered.
 * @property {number} cheermote.bits - Amount of bits cheered.
 * @property {number} cheermote.tier - Tier level of the cheermote.
 *
 * @typedef {object} Twitch.MentionFragment
 * @property {'mention'} type - Type of message fragment.
 * @property {string} text - Message text in fragment.
 * @property {object} mention - Metadata pertaining to the mention.
 * @property {string} mention.user_id - ID of the mentioned user.
 * @property {string} mention.user_name - Display name of the mentioned user.
 * @property {string} mention.user_login - Username of the mentioned user.
 */
