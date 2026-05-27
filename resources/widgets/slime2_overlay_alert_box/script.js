'use strict';

// Globals
// ***************************************************************************
const slime2 = window.slime2;

// set to true to automatically console log event data
const LOG_EVENT_DATA = true;

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
	exitAnimation: '',

	/** @type {Map<string, any>} */
	values: new Map(),

	/** @type {Map<string, Date>} */
	usersCleared: new Map(),
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
	logEventData(event.type, event.detail);
	Widget.values = new Map(Object.entries(event.detail));
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
}

function twitchEventListener(event) {
	logEventData(`${event.type} - ${event.detail.type}`, event.detail);

	const eventDate = new Date(event.detail.timestamp);
	const { type, data } = event.detail;

	// https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/
	// event.detail.data = event of each of these EventSub payloads
	switch (type) {
		// user banned or timed out
		case 'channel.chat.clear_user_messages':
			return handleClearUser(data, eventDate);
		// chat message deleted
		case 'channel.chat.message_delete':
			return handleChatMessageDelete(data);

		// follow
		case 'channel.follow':
			return handleFollow(data, eventDate);

		// raid
		case 'channel.raid':
			return handleRaid(data, eventDate);

		// channel point reward
		case 'channel.channel_points_custom_reward_redemption.add':
			return handleReward(data, eventDate);

		// power-up
		case 'channel.custom_power_up_redemption.add':
			return handlePowerUp(data, eventDate);

		// cheer
		case 'channel.cheer':
			return handleCheer(data, eventDate);

		// sub and resub
		case 'channel.subscribe':
		case 'channel.subscription.message':
			return handleSub(data, eventDate);

		// gift sub
		case 'channel.subscription.gift':
			return handleSubGift(data, eventDate);
	}
}

// Twitch Event Handlers
// ***************************************************************************

function handleFollow(data, eventDate) {
	const { user_id, user_login, user_name } = data;

	handleAlerts(
		'follow',
		alertId => {
			return true;
		},
		alertText => {
			return { text: alertText };
		},
	);
}

function handleRaid(data, eventDate) {
	const {
		from_broadcaster_user_id,
		from_broadcaster_user_login,
		from_broadcaster_user_name,
		viewers,
	} = data;
}

function handleReward(data, eventDate) {
	const {
		user_id,
		user_login,
		user_name,
		user_input,
		reward: { title, cost },
	} = data;
}

function handlePowerUp(data, eventDate) {
	const {
		user_id,
		user_login,
		user_name,
		user_input,
		custom_power_up: { title, bits },
	} = data;
}

function handleCheer(data, eventDate) {
	const { is_anonymous, user_id, user_login, user_name, message, bits } = data;
}

function handleSub(data, eventDate) {
	const {
		user_id,
		user_login,
		user_name,
		tier,
		is_gift,
		message,
		cumulative_months,
	} = data;
}

function handleSubGift(data, eventDate) {
	const { is_anonymous, user_id, user_login, user_name, total, tier } = data;
}

function handleClearUser(data, eventDate) {
	const { target_user_id } = data;
	Widget.usersCleared.set(target_user_id, eventDate);
}

function handleChatMessageDelete(data) {
	const { target_user_id } = data;
}

// Alerts Handler
// ***************************************************************************

/**
 * @param {string} type
 * @param {(alertId: string) => boolean} validateAlert
 * @param {(alertText: string) => { text: string; accent?: boolean }[]} parseAlertText
 */
function handleAlerts(type, validateAlert, parseAlertText) {
	/** @type {string[]} */
	const alerts = Widget.values.get(type) ?? [];
	for (const alertId of alerts) {
		if (validateAlert(alertId)) {
			const alertText = getMultiSectionValue(alertId, `${type}-text`) ?? '';
			displayAlert(type, alertId, parseAlertText(alertText));
			return;
		}
	}
}

/**
 * @param {string} type
 * @param {string} alertId
 * @param {{ text: string; accent?: boolean }[]} messageFragments
 */
function displayAlert(type, alertId, messageFragments) {
	/** @type {HTMLDivElement} */
	const alertElement = document.getElementById('alert');

	function getValue(settingId) {
		return getMultiSectionValue(alertId, `${type}-${settingId}`);
	}

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

	removeClassesWithPrefix('layout', 'animate');
	addClass(
		`layout_${getValue('layout') ?? 'below'}`,
		'animate__animated',
		`animate__${getValue('enter') ?? 'bounceIn'}`,
	);
	Widget.exitAnimation = getValue('exit') ?? 'bounceOut';

	// visual and sound settings

	const sounds = getValue('sound') ?? [];
	const soundVolumes = getValue('sound.volume') ?? [];
	const soundIndex = sounds.length > 0 ? randomIndex(sounds) : undefined;

	const videos = getValue('video') ?? [];
	const videoVolumes = getValue('video.volume') ?? [];
	const videoIndex = videos.length > 0 ? randomIndex(videos) : undefined;

	const images = getValue('image') ?? [];
	const imageIndex = images.length > 0 ? randomIndex(images) : undefined;

	/** @type {HTMLAudioElement} */
	const audioElement = document.getElementById('audio');
	if (soundIndex === undefined) {
		audioElement.pause();
	} else {
		const url = sounds[soundIndex];
		const volume = soundVolumes[soundIndex] ?? 0.2;

		audioElement.src = url;
		audioElement.volume = volume;
		audioElement.play();
		audioElement.onloadstart = () => {
			audioElement.volume = volume;
		};
	}

	const visual = getValue('visual') ?? 'none';
	removeClassesWithPrefix('visual');
	addClass(`visual_${getValue('visual') ?? 'none'}`);

	if (visual === 'image') {
		/** @type {HTMLImageElement} */
		const imageElement = document.getElementById('image');

		if (imageIndex === undefined) {
			removeClass('visual_image');
			addClass('visual_none');
		} else {
			const url = images[imageIndex];
			imageElement.src = url;
		}
	} else if (visual === 'video') {
		/** @type {HTMLVideoElement} */
		const videoElement = document.getElementById('video');

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
			videoElement.volume = volume;
			videoElement.play();
			videoElement.onloadstart = () => {
				videoElement.volume = volume;
			};
		}
	}

	// text settings

	[
		['font-name', `"${getValue('font') ?? 'Nunito'}"`],
		['font-weight', getValue('font-weight') ?? '700'],
		['font-size', `${getValue('font-size') ?? 32}px`],
		['text-align', `${getValue('text-align') ?? 'left'}`],
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
}

function hideAlert() {
	/** @type {HTMLDivElement} */
	const alertElement = document.getElementById('alert');
	alertElement.classList.add(
		'animate__animated',
		`animate__${Widget.exitAnimation}`,
	);
}

// Helpers
// ***************************************************************************

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
