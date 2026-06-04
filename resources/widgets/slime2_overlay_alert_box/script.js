'use strict';

// Globals
// ***************************************************************************
const slime2 = window.slime2;

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
	enterAnimation: '',
	exitAnimation: '',
	alertUserId: '',
	alertTimeout: NaN,

	/** @type {VoidFunction[]} */
	alertQueue: [],

	/** @type {Map<string, any>} */
	values: new Map(),

	/** @type {Set<string>} */
	usersCleared: new Set(),
};

const Twitch = {
	thirdPartyEmotes: new Map(),
};

// Listeners
// ***************************************************************************

addEventListener('slime2:widget-values', widgetValuesListener);
addEventListener('slime2:widget-accounts', widgetAccountsListener);
addEventListener('slime2:twitch-event', twitchEventListener);

function widgetValuesListener(event) {
	Widget.values = new Map(Object.entries(event.detail));
}

async function widgetAccountsListener(event) {
	const accounts = event.detail?.accounts ?? [];
	Widget.readAccount = accounts[0];
}

function twitchEventListener(event) {
	const { type, data } = event.detail;

	// https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/
	// event.detail.data = event of each of these EventSub payloads
	switch (type) {
		// user banned or timed out
		case 'channel.chat.clear_user_messages':
			return handleClearUser(data);
		// chat message deleted
		case 'channel.chat.message_delete':
			return handleChatMessageDelete(data);

		// follow
		case 'channel.follow':
			return handleFollow(data);

		// raid
		case 'channel.raid':
			return handleRaid(data);

		// channel point reward
		case 'channel.channel_points_custom_reward_redemption.add':
			return handleReward(data);

		// power-up
		case 'channel.custom_power_up_redemption.add':
			return handlePowerUp(data);

		// cheer
		case 'channel.cheer':
			return handleCheer(data);

		// sub and resub
		case 'channel.subscribe':
		case 'channel.subscription.message':
			return handleSub(data);

		// gift sub
		case 'channel.subscription.gift':
			return handleSubGift(data);
	}
}

// Twitch Event Handlers
// ***************************************************************************

function handleFollow(data) {
	const type = 'follow';
	const { user_id, user_login, user_name } = data;

	handleAlerts(user_id, type, {
		'{username}': { value: user_name, accent: true },
	});
}

function handleRaid(data) {
	const type = 'raid';
	const {
		from_broadcaster_user_id,
		from_broadcaster_user_login,
		from_broadcaster_user_name,
		viewers,
	} = data;

	handleAlerts(
		from_broadcaster_user_id,
		type,
		{
			'{username}': { value: from_broadcaster_user_name, accent: true },
			'{amount}': { value: viewers, accent: true },
		},
		alertId => {
			const getValue = createGetValueFunction(alertId, type);
			const condition = getValue('condition') ?? 'at-least';
			const amountCondition = getValue('amount') ?? 1;
			/** @type {string[]} */
			const usersCondition = getValue('users') ?? [];

			switch (condition) {
				case 'at-least':
					return viewers >= amountCondition;
				case 'exactly':
					return viewers === amountCondition;
				case 'users':
					return usersCondition.some(user => {
						return [
							from_broadcaster_user_login,
							from_broadcaster_user_name,
						].some(name => {
							return user.toLowerCase() === name.toLowerCase();
						});
					});
			}
			return false;
		},
	);
}

function handleReward(data) {
	const type = 'reward';
	const {
		user_id,
		user_login,
		user_name,
		user_input,
		reward: { title, cost },
	} = data;

	handleAlerts(
		user_id,
		type,
		{
			'{username}': { value: user_name, accent: true },
			'{reward}': { value: title, accent: true },
			'{amount}': { value: cost, accent: true },
			'{message}': { value: user_input },
		},
		alertId => {
			const getValue = createGetValueFunction(alertId, type);
			const condition = getValue('condition') ?? '';
			const nameCondition = getValue('name') ?? '';
			/** @type {string[]} */
			const wordsCondition = getValue('words') ?? [];

			switch (condition) {
				case 'exactly':
					return title === nameCondition;
				case 'contains':
					return wordsCondition.some(word => {
						return title.toLowerCase().includes(word.toLowerCase());
					});
				case 'any':
					return true;
			}
		},
	);
}

function handlePowerUp(data) {
	const type = 'power-up';
	const {
		user_id,
		user_login,
		user_name,
		user_input,
		custom_power_up: { title, bits },
	} = data;

	handleAlerts(
		user_id,
		type,
		{
			'{username}': { value: user_name, accent: true },
			'{power_up}': { value: title, accent: true },
			'{amount}': { value: bits, accent: true },
			'{message}': { value: user_input },
		},
		alertId => {
			const getValue = createGetValueFunction(alertId, type);
			const condition = getValue('condition') ?? '';
			const nameCondition = getValue('name') ?? '';
			/** @type {string[]} */
			const wordsCondition = getValue('words') ?? [];

			switch (condition) {
				case 'exactly':
					return title === nameCondition;
				case 'contains':
					return wordsCondition.some(word => {
						return title.toLowerCase().includes(word.toLowerCase());
					});
				case 'any':
					return true;
			}
		},
	);
}

function handleCheer(data) {
	const type = 'cheer';
	const { user_id, user_login, user_name, message, bits } = data;

	handleAlerts(
		user_id,
		type,
		{
			'{username}': { value: user_name, accent: true },
			'{amount}': { value: bits, accent: true },
			'{message}': { value: message },
		},
		alertId => {
			const getValue = createGetValueFunction(alertId, type);
			const condition = getValue('condition') ?? 'at-least';
			const amountCondition = getValue('amount') ?? 1;

			switch (condition) {
				case 'at-least':
					return bits >= amountCondition;
				case 'exactly':
					return bits === amountCondition;
			}
			return false;
		},
	);
}

function handleSub(data) {
	const type = 'sub';
	const {
		user_id,
		user_login,
		user_name,
		tier,
		is_gift,
		message,
		cumulative_months,
	} = data;

	// don't handle gift subs here
	if (is_gift) return;

	handleAlerts(
		user_id,
		type,
		{
			'{username}': { value: user_name, accent: true },
			'{sub_tier}': {
				value:
					tier === '3000' ? 'Tier 3' : tier === '2000' ? 'Tier 2' : 'Tier 1',
				accent: true,
			},
			'{amount}': { value: cumulative_months ?? 1, accent: true },
			'{message}': { value: message?.text },
		},
		alertId => {
			const getValue = createGetValueFunction(alertId, type);
			const condition = getValue('condition') ?? 'tier';
			const tierCondition = getValue('tier') ?? '1000';
			const amountCondition = getValue('amount') ?? 1;
			const isResub = !!cumulative_months;

			switch (condition) {
				case 'tier':
					return tier === tierCondition;
				case 'at-least':
					return amountCondition === 1 || cumulative_months >= amountCondition;
				case 'exactly':
					return amountCondition === 1 || cumulative_months === amountCondition;
			}
			return false;
		},
	);
}

function handleSubGift(data) {
	const type = 'gift-sub';
	const { is_anonymous, user_id, user_login, user_name, total, tier } = data;

	handleAlerts(
		user_id,
		type,
		{
			'{sender}': {
				value: is_anonymous ? 'Anonymous' : user_name,
				accent: true,
			},
			'{sub_tier}': {
				value:
					tier === '3000' ? 'Tier 3' : tier === '2000' ? 'Tier 2' : 'Tier 1',
				accent: true,
			},
			'{amount}': { value: total, accent: true },
		},
		alertId => {
			const getValue = createGetValueFunction(alertId, type);
			const condition = getValue('condition') ?? 'at-least';
			const amountCondition = getValue('amount') ?? 1;

			switch (condition) {
				case 'at-least':
					return total >= amountCondition;
				case 'exactly':
					return total === amountCondition;
				case 'individual':
					return total === 1;
			}
			return false;
		},
	);
}

function handleClearUser(data) {
	const { target_user_id } = data;
	// add user to usersCleared list, do not show alerts from them
	Widget.usersCleared.add(target_user_id);
	if (Widget.alertUserId === target_user_id) {
		// user of current alert has been banned/timed out,
		// immediately hide alert
		hideAlert(true);
	}
}

function handleChatMessageDelete(data) {
	const { target_user_id } = data;
	if (Widget.alertUserId === target_user_id) {
		// user of current alert has had a message deleted,
		// immediately hide alert
		hideAlert(true);
	}
}

// Alerts Handler
// ***************************************************************************

/**
 * @param {string} [userId]
 * @param {string} type
 * @param {Record<string, { value: string; accent?: boolean }>} variables
 * @param {(alertId: string) => boolean} [validateAlert]
 */
function handleAlerts(userId, type, variables, validateAlert) {
	/** @type {string[]} */
	const alerts = Widget.values.get(type) ?? [];

	for (const alertId of alerts) {
		const getValue = createGetValueFunction(alertId, type);
		const enabled = getValue('enabled') ?? true;

		if (enabled && (!validateAlert || validateAlert(alertId))) {
			/** @type {string} */
			const alertText = getValue('text') ?? '';
			const regexPart = stringsToRegexOr(Object.keys(variables));
			const regex = new RegExp(`(${regexPart})`, 'g');

			const messageParts = alertText.split(regex).reduce((parts, part) => {
				if (part) {
					const data = variables[part];
					if (data) {
						parts.push({ text: data.value, accent: data.accent });
					} else {
						parts.push({ text: part });
					}
				}
				return parts;
			}, /** @type {{ text: string; accent?: boolean }[]} */ ([]));

			setTimeout(
				() => {
					queueAlert(() => {
						playAlert(userId, type, alertId, messageParts);
					});
				},
				// alert delay handling
				(Widget.values.get('delay') || 0) * 1000,
			);
			return;
		}
	}
}

/** @param {VoidFunction} playAlertFunction */
function queueAlert(playAlertFunction) {
	// add to queue
	Widget.alertQueue.push(playAlertFunction);

	// if it's the only one in the queue, play it
	if (Widget.alertQueue.length === 1) {
		playAlertFunction();
	}
}

/**
 * @param {string} type
 * @param {string} alertId
 * @param {{ text: string; accent?: boolean }[]} messageParts
 */
function playAlert(userId, type, alertId, messageParts) {
	if (Widget.usersCleared.has(userId)) {
		hideAlert(true);
	}

	Widget.alertUserId = userId;
	const alertElement = getAlertElement();
	const getValue = createGetValueFunction(alertId, type);

	// use in CSS as var(--custom-[cssVarName])
	function setCustomCSS(cssVarName, value) {
		alertElement.style.setProperty(`--custom-${cssVarName}`, value);
	}

	function addClass(...classes) {
		alertElement.classList.add(...classes);
	}

	function removeClass(...classes) {
		alertElement.classList.remove(...classes);
	}

	function toggleClass(className, force) {
		alertElement.classList.toggle(className, force);
	}

	function removeClassesWithPrefix(...classPrefixes) {
		const classes = [];
		alertElement.classList.forEach(alertClass => {
			classPrefixes.forEach(prefix => {
				if (alertClass.startsWith(prefix)) {
					classes.push(alertClass);
				}
			});
		});
		removeClass(...classes);
	}

	// layout and animation settings

	Widget.enterAnimation = getValue('enter') ?? 'bounceIn';
	Widget.exitAnimation = getValue('exit') ?? 'bounceOut';

	removeClassesWithPrefix('layout', 'animate');
	addClass(
		`layout_${getValue('layout') ?? 'below'}`,
		'animate__animated',
		`animate__${Widget.enterAnimation}`,
		'enter',
	);

	// visual and sound settings

	const sounds = getValue('sound') ?? [];
	const soundVolumes = getValue('sound.volume') ?? [];
	const soundIndex = sounds.length > 0 ? randomIndex(sounds) : undefined;

	const videos = getValue('video') ?? [];
	const videoVolumes = getValue('video.volume') ?? [];
	const videoIndex = videos.length > 0 ? randomIndex(videos) : undefined;

	const images = getValue('image') ?? [];
	const imageIndex = images.length > 0 ? randomIndex(images) : undefined;

	const audioElement = getAudioElement();
	if (soundIndex === undefined) {
		audioElement.pause();
	} else {
		const url = sounds[soundIndex];
		const volume = soundVolumes[soundIndex] ?? 0.2;

		audioElement.src = url;
		audioElement.volume = 0;
		audioElement.play();
		audioElement.onloadstart = () => {
			smoothVolumeChange(audioElement, volume);
		};
	}

	const visual = getValue('visual') ?? 'none';
	removeClassesWithPrefix('visual');
	addClass(`visual_${getValue('visual') ?? 'none'}`);

	if (visual === 'image') {
		const imageElement = getImageElement();

		if (imageIndex === undefined) {
			removeClass('visual_image');
			addClass('visual_none');
		} else {
			const url = images[imageIndex];
			imageElement.src = url;
		}
	} else if (visual === 'video') {
		const videoElement = getVideoElement();

		if (videoIndex === undefined) {
			videoElement.pause();
			removeClass('visual_video');
			addClass('visual_none');
		} else {
			const url = videos[videoIndex];
			// mute video if a sound is given
			const volume =
				soundIndex === undefined ? (videoVolumes[videoIndex] ?? 0.2) : 0;

			videoElement.src = url;
			videoElement.volume = 0;
			videoElement.play();
			videoElement.onloadstart = () => {
				if (volume) {
					smoothVolumeChange(videoElement, volume);
				}
			};
		}
	}

	// text settings

	[
		['font-name', `"${getValue('font') ?? 'Nunito'}"`],
		['font-weight', getValue('font-weight') ?? '700'],
		['font-size', `${getValue('font-size') ?? 32}px`],
		['text-align', `${getValue('text-align') ?? 'center'}`],
		['text-color', getValue('text-color') ?? '#fff'],
		['accent-color', getValue('accent-color') ?? '#BCE760'],
	].forEach(([cssVarName, value]) => {
		setCustomCSS(cssVarName, value);
	});

	// shadow settings

	toggleClass('use-shadow', getValue('use-shadow') ?? false);

	[
		['flood', 'flood-color', 'shadow-color'],
		['blur', 'stdDeviation', 'shadow-blur'],
		['offset', 'dx', 'shadow-offset-x'],
		['offset', 'dy', 'shadow-offset-y'],
	].forEach(([id, attributeName, settingId]) => {
		document
			.getElementById(id)
			.setAttribute(attributeName, getValue(settingId) ?? 0);
	});

	const shadowSpread = getValue('shadow-spread') ?? 0;
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

	const messageChildren = messageParts.map(part => {
		const templateId = part.accent
			? 'accent-fragment-template'
			: 'text-fragment-template';
		const clone = cloneTemplate(templateId);
		clone.querySelector('span').textContent = part.text;
		return clone;
	});

	getMessageElement().replaceChildren(...messageChildren);

	Widget.alertTimeout = setTimeout(
		() => {
			hideAlert();
		},
		// alert duration handling
		(getValue('duration') || 0) * 1000,
	);
}

async function hideAlert(immediate = false) {
	clearTimeout(Widget.alertTimeout);
	const alertElement = getAlertElement();
	const audioElement = getAudioElement();
	const videoElement = getVideoElement();

	if (!immediate) {
		// display and wait for exit animation
		alertElement.classList.remove(`animate__${Widget.enterAnimation}`);
		alertElement.classList.add(
			'animate__animated',
			`animate__${Widget.exitAnimation}`,
			'exit',
		);

		// fade volume to 0
		[audioElement, videoElement].forEach(mediaElement => {
			smoothVolumeChange(mediaElement, 0);
		});

		await animationsFinished(getAlertElement());
	}

	// clear all classes from alert
	alertElement.classList.value = '';

	// mute, pause, and reset playback time to 0 of audio and video
	[getAudioElement(), getVideoElement()].forEach(mediaElement => {
		mediaElement.volume = 0;
		mediaElement.pause();
		mediaElement.currentTime = 0;
	});

	// clear message
	getMessageElement().replaceChildren();

	// remove alert from queue
	Widget.alertQueue.shift();

	// play next alert in queue
	if (Widget.alertQueue.length > 0) {
		const playNextAlertFunction = Widget.alertQueue[0];
		playNextAlertFunction();
	}
}

// Helpers
// ***************************************************************************

/** @returns {HTMLDivElement} */
function getAlertElement() {
	return document.getElementById('alert');
}

/** @returns {HTMLVideoElement} */
function getVideoElement() {
	return document.getElementById('video');
}

/** @returns {HTMLAudioElement} */
function getAudioElement() {
	return document.getElementById('audio');
}

/** @returns {HTMLImageElement} */
function getImageElement() {
	return document.getElementById('image');
}

/** @returns {HTMLDivElement} */
function getMessageElement() {
	return document.getElementById('message');
}

/**
 * Reference: https://stackoverflow.com/a/13149848
 *
 * @param {HTMLMediaElement} element
 * @param {number} newVolume
 */
async function smoothVolumeChange(
	element,
	newVolume,
	{ duration = 500, interval = 25 } = {},
) {
	const originalVolume = element.volume;
	const delta = newVolume - originalVolume;

	const ticks = Math.max(1, Math.floor(duration / interval));
	let tick = 0;

	return new Promise(resolve => {
		const timer = setInterval(() => {
			tick++;
			element.volume = Math.max(
				0,
				Math.min(1, originalVolume + swing(tick / ticks) * delta),
			);

			if (tick >= ticks) {
				element.volume = newVolume;
				clearInterval(timer);
				resolve();
			}
		}, interval);
	});
}

function swing(number) {
	return 0.5 - Math.cos(number * Math.PI) / 2;
}

/**
 * Gets a value from within a Multi-Section
 *
 * @param {string} subsectionId
 * @param {string} settingId
 * @returns {any}
 */
function getMultiSectionValue(subsectionId, settingId) {
	return Widget.values.get(`${subsectionId}.${settingId}`);
}

/**
 * @param {string} alertId
 * @param {string} type
 * @returns {(settingId: string) => any}
 */
function createGetValueFunction(alertId, type) {
	return settingId => {
		return getMultiSectionValue(alertId, `${type}-${settingId}`);
	};
}

/**
 * Given an array, returns a random index;
 *
 * @param {any[]} array
 * @returns {number}
 */
function randomIndex(array) {
	return Math.floor(Math.random() * array.length);
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
