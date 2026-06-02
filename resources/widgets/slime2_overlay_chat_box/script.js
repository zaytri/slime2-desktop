'use strict';

// Globals
// ***************************************************************************
const slime2 = window.slime2;

// set to true to automatically console log event data
const LOG_EVENT_DATA = false;

const EPOCH_DATE = new Date(0);

// for feColorMatrix
const IDENTITY_COLOR_MATRIX = [
	'1 0 0 0 0',
	'0 1 0 0 0',
	'0 0 1 0 0',
	'0 0 0 1 0',
];
const ALPHA_MULTIPLY_COLOR_MATRIX = [
	'1 0 0 0 0',
	'0 1 0 0 0',
	'0 0 1 0 0',
	'0 0 0 30 0',
];

const Widget = {
	readAccount: { id: '' },
	values: new Map(),
	messagesDeleted: new Set(),
	usersCleared: new Map(),
	lastChatClear: EPOCH_DATE,
	lastPlayedSound: EPOCH_DATE,
};

const Twitch = {
	badges: new Map(),
	cheermotes: new Map(),
	thirdPartyEmotes: new Map(),
};

// Listeners
// ***************************************************************************

addEventListener('slime2:widget-values', widgetValuesListener);
addEventListener('slime2:widget-accounts', widgetAccountsListener);
addEventListener('slime2:twitch-event', twitchEventListener);

function widgetValuesListener(event) {
	logEventData(event.type, event.detail);

	Widget.values = new Map(Object.entries(event.detail));

	const widgetElement = document.getElementById('widget');

	// use in CSS as var(--custom-[cssVarName])
	function setCustomCSS(cssVarName, value) {
		widgetElement.style.setProperty(`--custom-${cssVarName}`, value);
	}

	function addClass(...classes) {
		widgetElement.classList.add(...classes);
	}

	function removeClass(...classes) {
		widgetElement.classList.remove(...classes);
	}

	function toggleClass(className, force) {
		widgetElement.classList.toggle(className, force);
	}

	function removeClassesWithPrefix(...classPrefixes) {
		const classes = [];
		widgetElement.classList.forEach(widgetClass => {
			classPrefixes.forEach(prefix => {
				if (widgetClass.startsWith(prefix)) {
					classes.push(widgetClass);
				}
			});
		});
		removeClass(...classes);
	}

	// text settings
	[
		// quotation marks around font name is necessary
		// to handle font names that contain spaces
		['font-name', `"${Widget.values.get('font-name') ?? 'Inter'}"`],
		['font-size', `${Widget.values.get('font-size') ?? 14}px`],
		['font-weight', Widget.values.get('font-weight') ?? 'normal'],
		['max-width', `${Widget.values.get('max-width') ?? 500}px`],
		['line-clamp', Widget.values.get('max-lines') ?? 4],
		['message-color', Widget.values.get('message-color') ?? 'white'],
		['username-color', Widget.values.get('custom-username-color') ?? 'white'],
	].forEach(([cssVarName, value]) => {
		setCustomCSS(cssVarName, value);
	});

	removeClassesWithPrefix('username-color');
	addClass(`username-color_${Widget.values.get('username-color')}`);

	// shadow settings

	toggleClass('use-shadow', Widget.values.get('use-shadow') ?? false);

	[
		['flood', 'flood-color', 'shadow-color'],
		['blur', 'stdDeviation', 'shadow-blur'],
		['offset', 'dx', 'shadow-offset-x'],
		['offset', 'dy', 'shadow-offset-y'],
	].forEach(([id, attributeName, settingId]) => {
		document
			.getElementById(id)
			.setAttribute(attributeName, Widget.values.get(settingId) ?? 0);
	});

	const shadowSpread = Widget.values.get('shadow-spread') ?? 0;
	const useRounding = shadowSpread > 1; // apply rounding when spread is 2+
	const colorMatrix = useRounding
		? ALPHA_MULTIPLY_COLOR_MATRIX
		: IDENTITY_COLOR_MATRIX;
	[
		// using rounding effectively adds 2px, so subtract that when used
		['morph', 'radius', useRounding ? shadowSpread - 2 : shadowSpread],
		['rounding-blur', 'stdDeviation', useRounding ? 1 : 0],
		['rounding-matrix', 'values', colorMatrix.join(' ')],
	].forEach(([id, attributeName, value]) => {
		document.getElementById(id).setAttribute(attributeName, value);
	});

	// position settings

	removeClassesWithPrefix('arrangement', 'vertical', 'horizontal');
	addClass(
		`arrangement_${Widget.values.get('arrangement') ?? 'vertical'}`,
		`vertical_${Widget.values.get('vertical-flow') ?? 'to-top'}`,
		`vertical_${Widget.values.get('vertical-align') ?? 'left'}`,
		`horizontal_${Widget.values.get('horizontal-flow') ?? 'to-left'}`,
		`horizontal_${Widget.values.get('horizontal-align') ?? 'top'}`,
	);

	// badge settings

	setCustomCSS(
		'badge-display',
		Widget.values.get('hide-badges') ? 'none' : 'inline',
	);

	// pronoun settings

	setCustomCSS(
		'pronoun-display',
		Widget.values.get('pronouns-display') === 'hidden' ? 'none' : 'inline',
	);
	setCustomCSS(
		'pronoun-transform',
		Widget.values.get('pronouns-display') ?? 'lowercase',
	);

	// animation settings

	removeClassesWithPrefix('animation');
	toggleClass('animation-smooth', Widget.values.get('smooth-enter') ?? true);
	addClass(
		`animation-enter_${Widget.values.get('enter-animation') ?? 'none'}`,
		`animation-exit_${Widget.values.get('exit-animation') ?? 'none'}`,
	);
}

async function widgetAccountsListener(event) {
	logEventData(event.type, event.detail);

	const accounts = event.detail?.accounts ?? [];
	const newReadAccount = accounts[0];

	// same account as stored account or undefined, skip processing
	if (!newReadAccount?.id || Widget.readAccount.id === newReadAccount.id) {
		return;
	}

	Widget.readAccount = newReadAccount;

	const [cheermotes, globalBadges, channelBadges, bttvUser, ffzRoom] =
		await Promise.all([
			getTwitchCheermotes(),
			getTwitchGlobalBadges(),
			getTwitchChannelChatBadges(),
			getBttvUser(),
			getFfzRoom(),
		]);

	// collect bttv emotes into Twitch.thirdPartyEmotes
	bttvUser?.emotes?.forEach(emote => {
		Twitch.thirdPartyEmotes.set(emote.code, { type: 'bttv', data: emote });
	});

	// collect ffz emotes into Twitch.thirdPartyEmotes
	ffzRoom?.emotes?.forEach(emote => {
		Twitch.thirdPartyEmotes.set(emote.name, { type: 'ffz', data: emote });
	});

	// collect global badges into Twitch.badges
	globalBadges?.forEach(badge => {
		const badgeVersions = new Map();

		badge.versions.forEach(version => {
			badgeVersions.set(version.id, version);
		});

		Twitch.badges.set(badge.set_id, {
			...badge,
			versions: badgeVersions,
		});
	});

	// collect channel badges into Twitch.badges
	channelBadges?.forEach(badge => {
		const badgeVersions = new Map();

		badge.versions.forEach(version => {
			badgeVersions.set(version.id, version);
		});

		Twitch.badges.set(badge.set_id, {
			...badge,
			versions: badgeVersions,
		});
	});

	// collect cheermotes into Twitch.cheermotes
	cheermotes?.forEach(cheermote => {
		const cheermoteTiers = new Map();

		cheermote.tiers.forEach(tier => {
			cheermoteTiers.set(tier.min_bits, tier);
		});

		Twitch.cheermotes.set(cheermote.prefix, {
			...cheermote,
			tiers: cheermoteTiers,
		});
	});
}

function twitchEventListener(event) {
	logEventData(`${event.type} - ${event.detail.type}`, event.detail);

	const eventDate = new Date(event.detail.timestamp);
	const { type, data } = event.detail;

	switch (type) {
		case 'channel.chat.message':
			return handleChatMessage(data, eventDate);
		case 'channel.chat.message_delete':
			return handleChatMessageDelete(data);
		case 'channel.chat.clear':
			return handleChatClear(eventDate);
		case 'channel.chat.clear_user_messages':
			return handleChatClearUserMessages(data, eventDate);
		case 'channel.chat.notification':
			if (data.notice_type === 'announcement') {
				// treat announcements as regular chat messages
				return handleChatMessage(data, eventDate);
			}
			break;
	}
}

// Twitch Event Handlers
// ***************************************************************************

async function handleChatMessage(data, eventDate) {
	const {
		message,
		chatter_user_name,
		chatter_user_login,
		chatter_user_id,
		message_id,
		color,
		badges,
		message_type,
	} = data;

	// filter out users that match Hide Users
	for (const hideName of Widget.values.get('hide-users') ?? []) {
		if (
			chatter_user_name.toLowerCase() === hideName.toLowerCase() ||
			chatter_user_login.toLowerCase() === hideName.toLowerCase()
		) {
			return;
		}
	}

	// filter out messages that start with these prefixes
	for (const hidePrefix of Widget.values.get('hide-prefixes') ?? []) {
		if (message.text.startsWith(hidePrefix)) {
			return;
		}
	}

	// filter out messages that contain these words
	for (const hideWord of Widget.values.get('hide-words') ?? []) {
		if (message.text.toLowerCase().includes(hideWord.toLowerCase())) {
			return;
		}
	}

	// filter out first time chat messages
	if (Widget.values.get('hide-first-chat') && message_type === 'user_intro') {
		return;
	}

	// filter out users who fail the follow age check
	if (!(await checkFollowAge(chatter_user_id, eventDate))) return;

	// get user's pronouns
	const pronouns = await getPronouns(
		'twitch',
		chatter_user_id,
		chatter_user_login,
	);

	const messageTemplateClone = cloneTemplate('message-template');
	const messageElement = messageTemplateClone.querySelector('.message');

	// apply data attributes for message deletion reference
	messageElement.setAttribute('data-message-id', message_id);
	messageElement.setAttribute('data-user-id', chatter_user_id);

	// apply username color
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

	// build user half of message
	messageTemplateClone
		.querySelector('.user')
		.appendChild(
			buildUser(chatter_user_name, chatter_user_login, pronouns, badges),
		);

	// build text half of message
	const contentElement = messageTemplateClone.querySelector('.content');
	message.fragments.forEach(fragment => {
		const node = buildMessageFragment(fragment);
		if (Array.isArray(node)) {
			// when a text fragment is split using third party emotes
			contentElement.append(...node);
		} else {
			contentElement.append(node);
		}
	});

	// wait for all images to load
	await Promise.allSettled(
		[...messageTemplateClone.querySelectorAll('img').values()].map(
			async imageElement => {
				return new Promise(resolve => {
					if (imageElement.complete) {
						resolve();
						return;
					}

					function onLoad() {
						imageElement.removeEventListener('load', onLoad);
						resolve();
					}

					imageElement.addEventListener('load', onLoad);
				});
			},
		),
	);

	setTimeout(
		() => {
			const widgetBody = document.getElementById('widget');

			if (
				// chat cleared
				eventDate < Widget.lastChatClear ||
				// message deleted
				Widget.messagesDeleted.has(message_id) ||
				// user banned or timed out
				eventDate < (Widget.usersCleared.get(chatter_user_id) ?? EPOCH_DATE)
			) {
				// if message was already deleted by the above checks, don't render
				return;
			}

			displayMessage(messageTemplateClone, message_id);

			// sound handling
			const soundSrc = Widget.values.get('sound');
			if (soundSrc) {
				const now = new Date();
				const cooldown = (Widget.values.get('sound-cooldown') ?? 5) * 1000;
				const timeSinceLastSound =
					now.getTime() - Widget.lastPlayedSound.getTime();

				if (timeSinceLastSound > cooldown) {
					// play sound once it passes the cooldown check
					const audio = new Audio(soundSrc);
					audio.volume = Widget.values.get('sound.volume') ?? 0.2;
					audio.play();
					Widget.lastPlayedSound = now;
				}
			}

			// max message handling
			const messages = widgetBody.querySelectorAll('.message:not(.exit)');
			const maxMessages = Widget.values.get('max-messages') ?? 50;
			for (let i = 0; i < messages.length - maxMessages; i++) {
				// hide the oldest visible messages
				const messageElement = messages[i];
				hideMessage(messageElement);
			}

			// message expiration handling
			if (Widget.values.get('expire-messages')) {
				setTimeout(
					() => {
						const messageElement = document
							.getElementById('widget')
							.querySelector(`[data-message-id='${message_id}']`);
						if (messageElement) {
							hideMessage(messageElement);
						}
					},
					// hide after this many seconds
					(Widget.values.get('hide-time') ?? 300) * 1000,
				);
			}
		},
		// message delay handling
		(Widget.values.get('delay') || 0) * 1000,
	);
}

/**
 * @param {DocumentFragment} messageTemplateClone
 * @param {string} messageId
 */
function displayMessage(messageTemplateClone, messageId) {
	/** @type {HTMLDivElement} */
	const widgetBody = document.getElementById('widget');

	const resizeObserver = new ResizeObserver((entries, observer) => {
		const entry = entries.pop();
		if (!entry) return;

		observer.disconnect();

		const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];
		const newMessageElement = entry.target;

		// set enter animation and sizing as soon as message is rendered

		newMessageElement.classList.add('enter');
		[
			['max-message-width', `${Math.ceil(width) + 50}px`],
			['max-message-height', `${Math.ceil(height) + 50}px`],
		].forEach(([cssVarName, value]) => {
			newMessageElement.style.setProperty(`--${cssVarName}`, value);
		});

		animationsFinished(newMessageElement).finally(() => {
			const hideClipping = Widget.values.get('hide-clipping') ?? true;
			if (hideClipping) {
				// handle clipping

				/** @type {NodeListOf<HTMLElement>} */
				const visibleMessages = document
					.getElementById('widget')
					.querySelectorAll('.message:not(.exit)');

				for (const messageElement of visibleMessages) {
					/** @type {HTMLElement} */
					const parent = messageElement.offsetParent;
					const { offsetTop, offsetLeft, offsetHeight, offsetWidth } =
						messageElement;

					const top = offsetTop;
					const left = offsetLeft;
					const bottom = parent.offsetHeight - offsetTop - offsetHeight;
					const right = parent.offsetWidth - offsetLeft - offsetWidth;

					if (top < 0 || left < 0 || bottom < 0 || right < 0) {
						// found message clipping out of bounds
						hideMessage(messageElement);
					} else {
						// all other messages are in bounds, skip processing them
						return;
					}
				}
			}
		});
	});

	// append clone
	widgetBody.appendChild(messageTemplateClone);

	// add observer
	resizeObserver.observe(
		widgetBody.querySelector(`.message[data-message-id='${messageId}']`),
	);
}

/** @param {HTMLElement} messageElement */
function hideMessage(messageElement) {
	// immediately remove element from DOM if no animation
	if ((Widget.values.get('exit-animation') ?? 'none') === 'none') {
		messageElement.remove();
		return;
	}

	messageElement.classList.add('exit');

	// automatically remove element after animations finish
	animationsFinished(messageElement).finally(() => {
		messageElement.remove();
	});
}

function handleChatMessageDelete(data) {
	const { message_id } = data;
	Widget.messagesDeleted.add(message_id);
	const messageElement = document
		.getElementById('widget')
		.querySelector(`[data-message-id='${message_id}']`)
		?.remove();
}

function handleChatClear(eventDate) {
	Widget.lastChatClear = eventDate;
	document
		.getElementById('widget')
		.querySelectorAll('.message')
		.forEach(element => element.remove());
}

function handleChatClearUserMessages(data, eventDate) {
	const { target_user_id } = data;
	Widget.usersCleared.set(target_user_id, eventDate);
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
		const badgeVersion = Twitch.badges
			.get(userBadge.set_id)
			?.versions.get(userBadge.id);

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

	const parsedFragments = [];

	const thirdPartyEmoteNames = Array.from(Twitch.thirdPartyEmotes.keys());
	text.split(createEmoteRegex(thirdPartyEmoteNames)).forEach(part => {
		if (part === '') return;

		const thirdPartyEmote = Twitch.thirdPartyEmotes.get(part) ?? {};

		if (thirdPartyEmote.type === 'bttv') {
			const { id, animated } = thirdPartyEmote.data;
			const src = buildBttvEmoteImageUrl(id, animated);
			parsedFragments.push({ type: 'emote', text: part, src });
		} else if (thirdPartyEmote.type === 'ffz') {
			const { urls, animated: animatedUrls } = thirdPartyEmote.data;
			const src = buildFfzEmoteImageUrl(urls, animatedUrls);
			parsedFragments.push({ type: 'emote', text: part, src });
		} else {
			parsedFragments.push({ type: 'text', text: part });
		}
	});

	return parsedFragments.map(fragment => {
		if (fragment.type === 'emote') {
			return buildParsedEmoteFragment(fragment);
		} else {
			return buildParsedTextFragment(fragment);
		}
	});
}

function buildParsedTextFragment(parsedTextFragment) {
	const { text } = parsedTextFragment;

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
	const { text, emote } = emoteFragment;

	let src = buildTwitchEmoteImageUrl(emote.id);

	const thirdPartyEmote = Twitch.thirdPartyEmotes.get(text) ?? {};

	// allow third party emotes to override twitch emotes
	if (thirdPartyEmote.type === 'bttv') {
		const { id, animated } = thirdPartyEmote.data;
		src = buildBttvEmoteImageUrl(id, animated);
	} else if (thirdPartyEmote.type === 'ffz') {
		const { urls, animated: animatedUrls } = thirdPartyEmote.data;
		const src = buildFfzEmoteImageUrl(urls, animatedUrls);
	}

	return buildParsedEmoteFragment({ type: 'emote', text, src });
}

function buildParsedEmoteFragment(parsedEmoteFragment) {
	const { src } = parsedEmoteFragment;

	const emoteClone = cloneTemplate('emote-fragment-template');
	emoteClone.querySelector('.emote').src = src;

	return emoteClone;
}

function buildCheermoteFragment(cheermoteFragment) {
	const { cheermote } = cheermoteFragment;

	const cheermoteClone = cloneTemplate('cheermote-fragment-template');

	const tier = Twitch.cheermotes
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

// Requests
// ***************************************************************************

/** Returns array of pronouns to show, or `null` if they haven't set any */
async function getPronouns(platform, userId, username) {
	return slime2.request(Widget.readAccount.id, 'get-pronouns', {
		platform,
		user_id: userId,
		username,
	});
}

/** Returns ISO string of follow date, or `null` if they aren't following. */
async function getTwitchFollowDate(userId) {
	return slime2.request(Widget.readAccount.id, 'get-twitch-follow-date', {
		user_id: userId,
	});
}

/**
 * Returns array of Twitch Cheermotes
 *
 * https://dev.twitch.tv/docs/api/reference/#get-cheermotes
 */
async function getTwitchCheermotes() {
	return slime2.request(Widget.readAccount.id, 'get-twitch-cheermotes');
}

/**
 * Returns array of Twitch Global Badges
 *
 * https://dev.twitch.tv/docs/api/reference/#get-global-chat-badges
 */
async function getTwitchGlobalBadges() {
	return slime2.request(Widget.readAccount.id, 'get-twitch-global-badges');
}

/**
 * Returns array of Twitch Channel Chat Badges
 *
 * https://dev.twitch.tv/docs/api/reference/#get-channel-chat-badges
 */
async function getTwitchChannelChatBadges() {
	return slime2.request(
		Widget.readAccount.id,
		'get-twitch-channel-chat-badges',
	);
}

/**
 * Returns BetterTTV Twitch User
 *
 * https://betterttv.com/developers/api#user
 */
async function getBttvUser() {
	return slime2.request(Widget.readAccount.id, 'get-betterttv-user', {
		platform: 'twitch',
	});
}

/**
 * Returns FrankerFaceZ Twitch Room
 *
 * https://api.frankerfacez.com/docs/#/Rooms
 */
async function getFfzRoom() {
	return slime2.request(Widget.readAccount.id, 'get-frankerfacez-room', {
		platform: 'twitch',
	});
}

// Helpers
// ***************************************************************************

/** Returns true if user passes the min follow age check */
async function checkFollowAge(userId, eventDate) {
	if (!Widget.values.get('follower-only')) {
		// not in follower only mode, allow everyone
		return true;
	}

	const followDateString = await getTwitchFollowDate(userId);
	if (!followDateString) {
		// user isn't a follower
		return false;
	}

	const followDate = new Date(followDateString);

	// follow age given in hours
	const minFollowTime = (Widget.values.get('follow-age') ?? 0) * 60 * 60 * 1000;
	const userFollowTime = eventDate.getTime() - followDate.getTime();

	return userFollowTime > minFollowTime;
}

/** Builds Twitch emote image URL given the emote ID. */
const BASE_TWITCH_EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v2';
function buildTwitchEmoteImageUrl(id, options = {}) {
	// format = 'default' | 'static' | 'animated'
	// theme_mode = 'dark' | 'light'
	// size = '1.0' | '2.0' | '3.0'
	const { format = 'default', theme_mode = 'dark', size = '3.0' } = options;
	return [BASE_TWITCH_EMOTE_URL, id, format, theme_mode, size].join('/');
}

/** Builds BetterTTV emote image URL given the emote ID and animated value */
const BASE_BTTV_EMOTE_URL = 'https://cdn.betterttv.net/emote';
function buildBttvEmoteImageUrl(id, animated, options = {}) {
	// staticEmote = boolean
	// size = '1x' | '2x' | '3x'
	const { staticEmote = false, size = '3x' } = options;
	const urlParts = [BASE_BTTV_EMOTE_URL, id];

	// staticEmote only works if the emote was animated
	if (animated && staticEmote) urlParts.push('static');

	urlParts.push(size);
	return urlParts.join('/');
}

/** Builds FrankerFaceZ emote image URL given the possible URLs */
function buildFfzEmoteImageUrl(urls, animatedUrls) {
	// urls['1'] is guaranteed, the others are not
	return (
		animatedUrls?.['4'] ||
		animatedUrls?.['2'] ||
		animatedUrls?.['1'] ||
		urls['4'] ||
		urls['2'] ||
		urls['1']
	);
}

/**
 * Given the ID of an HTML template, returns a copy of its DocumentFragment
 * contents
 *
 * @param {string} id
 * @returns {DocumentFragment}
 */
function cloneTemplate(id) {
	/** @type {HTMLTemplateElement} */
	const element = document.getElementById(id);

	if (!element) {
		throw Error(`Template with id "${id}" not found!`);
	}

	if (element.tagName !== 'TEMPLATE') {
		throw Error(`Element with id "${id}" is not a template!`);
	}

	return document.importNode(element.content, true);
}

/**
 * Returns a Promise that resolves when all of the animations on this element
 * have finished playing.
 *
 * @param {HTMLElement} element
 */
async function animationsFinished(element) {
	return Promise.allSettled(
		element.getAnimations().map(animation => {
			return animation.finished;
		}),
	);
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

/** Formatted console log given type and data, if `LOG_EVENT_DATA = true` */
function logEventData(type, data) {
	if (!LOG_EVENT_DATA) return;

	console.log(
		`%c${type}`,
		[
			['display', 'block'],
			['padding', '2px 8px'],
			['border-radius', '4px'],
			['background-color', '#d8fa99'],
			['color', '#0d542b'],
			['font-weight', 'bold'],
			['font-size', '14px'],
			['border', '2px solid #0d542b'],
		]
			.map(([property, value]) => `${property}: ${value};`)
			.join(' '),
		data,
	);
}

/**
 * When this regex is used in {@link String.prototype.split}, it will result in
 * an array of strings split up by the emote names, with the emote names
 * included. If an emote name is at the beginning or end of the string, then the
 * array will include an empty string at the beginning or end.
 *
 * Examples:
 *
 *     const regex = createEmoteRegex(['emote', 'emote2']);
 *     'aaa emote aaa'.split(regex) === ['aaa ', 'emote', ' aaa'];
 *     'emote emote2'.split(regex) === ['', 'emote', '', 'emote2', ''];
 *     ',emote!'.split(regex) === [',', 'emote', '!'];
 *     'emoteemote2'.split(regex) === ['emoteemote2'];
 */
function createEmoteRegex(emoteNames) {
	// regex escape every emote name, and join with the regex OR character
	const regexPart = emoteNames
		.map(emoteName => {
			return escapeRegExp(emoteName);
		})
		.join('|');

	/**
	 * Explaining this regex so that I know how it works in the future...
	 *
	 * These are all valid to go directly before or after an emote:
	 *
	 * | Regex   | Explanation                        |
	 * | ------- | ---------------------------------- |
	 * | `\s`    | any whitespace character           |
	 * | `^`     | beginning of the string            |
	 * | `$`     | end of the string                  |
	 * | `[.,!]` | period, comma, or exclamation mark |
	 *
	 * These match a group without including it in the result:
	 *
	 * | Regex  | Explanation                                                      |
	 * | ------ | ---------------------------------------------------------------- |
	 * | (?<= ) | Positive lookbehind. Matches a group before the main expression. |
	 * | (?= )  | Positive lookahead. Matches a group after the main expression.   |
	 */
	const regex = String.raw`(?<=\s|[.,!]|^)(${regexPart})(?=\s|[.,!]|$)`;
	return new RegExp(regex, 'g');
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
