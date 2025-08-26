// Globals
// ***************************************************************************
const slime2 = window.slime2;

const EPOCH = new Date(0);

const Widget = {
	values: {},
	channelBadges: new Map(),
	globalBadges: new Map(),
	cheermotes: new Map(),
	bttv: {},
	ffz: {},
	messagesDeleted: new Map(),
	usersCleared: new Map(),
	lastChatClear: EPOCH,
};

// Listeners
// ***************************************************************************

function widgetValuesListener(event) {
	console.log('slime2:widget-values', event.detail);

	const widgetElement = document.getElementById('widget');

	function setStyle(cssProperty, value) {
		widgetElement.style.setProperty(cssProperty, value);
	}

	function addClass(...classes) {
		widgetElement.classList.add(...classes);
	}

	function removeClass(...classes) {
		widgetElement.classList.remove(...classes);
	}

	Widget.values = event.detail;

	// quotation marks around font name is necessary
	// for font names that contain spaces
	setStyle('--custom-font-name', `"${Widget.values['font-name']}"`);
	setStyle('--custom-font-size', `${Widget.values['font-size']}px`);
	setStyle('--custom-font-weight', Widget.values['font-weight']);
	setStyle('--custom-font-color', Widget.values['message-color']);
	setStyle('--custom-username-color', Widget.values['custom-username-color']);
	setStyle('--custom-bg-color', Widget.values['background-color']);

	removeClass(
		'username-color-twitch',
		'username-color-custom',
		'username-color-twitch-light',
		'username-color-twitch-dark',
	);
	addClass(`username-color-${Widget.values['username-color']}`);
}

function widgetAccountsListener(event) {
	console.log('slime2:widget-accounts', event.detail);

	const accountData = event.detail.accounts[0];

	// converting arrays to map for fast access

	accountData.globalBadges.forEach(badge => {
		const badgeVersions = new Map();
		badge.versions.forEach(version => {
			badgeVersions.set(version.id, version);
		});
		Widget.globalBadges.set(badge.set_id, {
			...badge,
			versions: badgeVersions,
		});
	});

	accountData.channelBadges.forEach(badge => {
		const badgeVersions = new Map();
		badge.versions.forEach(version => {
			badgeVersions.set(version.id, version);
		});
		Widget.channelBadges.set(badge.set_id, {
			...badge,
			versions: badgeVersions,
		});
	});

	accountData.cheermotes.forEach(cheermote => {
		const cheermoteTiers = new Map();
		cheermote.tiers.forEach(tier => {
			cheermoteTiers.set(tier.min_bits, tier);
		});
		Widget.cheermotes.set(cheermote.prefix, {
			...cheermote,
			tiers: cheermoteTiers,
		});
	});

	Widget.bttv = accountData.betterTTV;
	Widget.ffz = accountData.frankerFaceZ;
}

function twitchEventListener(event) {
	console.log('slime2:twitch-event', event.detail.type, event.detail);

	const timestamp = new Date(event.timestamp);

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
}

addEventListener('slime2:widget-values', widgetValuesListener);
addEventListener('slime2:widget-accounts', widgetAccountsListener);
addEventListener('slime2:twitch-event', twitchEventListener);

// Event Handlers
// ***************************************************************************

async function handleChatMessage(data, timestamp) {
	const {
		message,
		chatter_user_name,
		chatter_user_login,
		chatter_user_id,
		message_id,
		color,
		badges,
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

	if (color) {
		messageElement.style.setProperty('--twitch-username-color', color);
		messageElement.style.setProperty(
			'--twitch-light-username-color',
			lightTextColor(color),
		);
		messageElement.style.setProperty(
			'--twitch-dark-username-color',
			darkTextColor(color),
		);
	}

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
		timestamp < Widget.lastChatClear ||
		// message deleted
		Widget.messagesDeleted.get(message_id) ||
		// user banned or timed out
		timestamp < (Widget.usersCleared.get(chatter_user_id) ?? EPOCH)
	) {
		// if message was already deleted by the above checks, don't render
		return;
	}

	widgetBody.appendChild(messageTemplateClone);
}

async function handleChatMessageDelete(data) {
	const { message_id } = data;
	Widget.messagesDeleted.set(message_id, true);
	document
		.getElementById('widget')
		.querySelectorAll(`[data-message-id='${message_id}']`)
		.forEach(element => element.remove());
}

async function handleChatClear(timestamp) {
	Widget.lastChatClear = timestamp;
	document
		.getElementById('widget')
		.querySelectorAll('.message')
		.forEach(element => element.remove());
}

async function handleChatClearUserMessages(data, timestamp) {
	const { target_user_id } = data;
	Widget.usersCleared.set(target_user_id, timestamp);
	document
		.getElementById('widget')
		.querySelectorAll(`[data-user-id='${target_user_id}']`)
		.forEach(element => element.remove());
}

// Element Builders
// ***************************************************************************

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
		userClone.querySelector('.pronouns').textContent =
			` (${pronouns.join('/')})`;
	}

	const badgeClones = buildBadges(badges);
	badgeClones.forEach(badgeClone =>
		userClone.querySelector('.badges').append(badgeClone),
	);

	return userClone;
}

function buildBadges(badges) {
	return badges.map(userBadge => {
		const badgeVersion =
			Widget.channelBadges.get(userBadge.set_id)?.versions.get(userBadge.id) ??
			Widget.globalBadges.get(userBadge.set_id)?.versions.get(userBadge.id);

		const badgeClone = cloneTemplate('badge-template');

		if (badgeVersion) {
			badgeClone
				.querySelector('.badge')
				.setAttribute('src', badgeVersion.image_url_4x);
		}

		return badgeClone;
	});
}

function buildMessageFragment(fragment) {
	switch (fragment.type) {
		case 'emote':
			return buildEmoteFragment(fragment);
		case 'mention':
			return buildMentionFragment(fragment);
		case 'cheermote':
			return buildCheermoteFragment(fragment);
		case 'text':
		default:
			return buildTextFragment(fragment);
	}
}

function buildTextFragment(textFragment) {
	const { text } = textFragment;

	const textClone = cloneTemplate('text-fragment-template');
	textClone.querySelector('.text').textContent = text;

	return textClone;
}

function buildMentionFragment(mentionFragment) {
	const { mention } = mentionFragment;

	const mentionClone = cloneTemplate('mention-fragment-template');
	mentionClone.querySelector('.mention').textContent = `@${mention.user_login}`;

	return mentionClone;
}

function buildEmoteFragment(emoteFragment) {
	const { emote } = emoteFragment;

	const emoteClone = cloneTemplate('emote-fragment-template');
	emoteClone.querySelector('.emote').src = buildTwitchEmoteImageUrl(emote.id);

	return emoteClone;
}

function buildCheermoteFragment(cheermoteFragment) {
	const { cheermote } = cheermoteFragment;

	const cheermoteClone = cloneTemplate('cheermote-fragment-template');

	const tier = Widget.cheermotes
		.get(cheermote.prefix)
		?.tiers.get(cheermote.tier);

	if (tier) {
		cheermoteClone.querySelector('.cheermote').src =
			tier.images.dark.animated['4'];
		cheermoteClone.querySelector('.cheer-amount').textContent = cheermote.bits;
		cheermoteClone
			.querySelector('.cheer-amount')
			.style.setProperty('color', tier.color);
	}

	return cheermoteClone;
}

// Helpers
// ***************************************************************************

/** Builds Twitch emote image URL given the emote ID. */
function buildTwitchEmoteImageUrl(id, options = {}) {
	const { animation = 'default', background = 'dark', size = '3.0' } = options;

	return `https://static-cdn.jtvnw.net/emoticons/v2/${id}/${animation}/${background}/${size}`;
}

/** Given the ID of an HTML template, returns the cloned contents */
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

/** Lightens the text color if needed to be accessible on a black background */
function lightTextColor(textColor) {
	return accessibleTextColor(textColor, 'black');
}

/** Darkens the text color if needed to be accessible on a white background */
function darkTextColor(textColor) {
	return accessibleTextColor(textColor, 'white');
}

/**
 * Given a text color and a background color of black or white, modifies the
 * color if needed to be accessible on that background using Color.js
 */
function accessibleTextColor(textColor, backgroundColor) {
	const targetTextColor = backgroundColor === 'black' ? 'white' : 'black';

	let newColor = textColor;

	const potentialColors = Color.steps(textColor, targetTextColor, {
		space: 'hsv',
		outputSpace: 'srgb',
		steps: 9,
	});

	for (const potentialColor of potentialColors) {
		if (Math.abs(Color.contrastAPCA(backgroundColor, potentialColor)) > 60) {
			newColor = potentialColor;
			break;
		}
	}

	return new Color(newColor).toString({ format: 'hex' });
}
