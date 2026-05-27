'use strict';

/* Globals *******************************************************************/
const slime2 = window.slime2;

// set to true to automatically console log event data
const LOG_EVENT_DATA = true;

const Widget = {
	readAccount: { id: '' },
	values: new Map(),
};

/* Listeners *****************************************************************/

addEventListener('slime2:widget-values', widgetValuesListener);
addEventListener('slime2:widget-accounts', widgetAccountsListener);
addEventListener('slime2:twitch-event', twitchEventListener);
addEventListener('slime2:widget-button-click', widgetButtonClickListener);

function widgetButtonClickListener(event) {
	logEventData(event.type, event.detail);

	if (event.detail.id === 'button-id') {
	}
}

function widgetValuesListener(event) {
	logEventData(event.type, event.detail);

	Widget.values = new Map(Object.entries(event.detail));

	const text = Widget.values.get('example-text-input') ?? '';
}

function widgetAccountsListener(event) {
	logEventData(event.type, event.detail);

	const accounts = event.detail?.accounts ?? [];

	Widget.readAccount = accounts[0] ?? Widget.readAccount;
}

function twitchEventListener(event) {
	logEventData(`${event.type} - ${event.detail.type}`, event.detail);

	const { type, data } = event.detail;

	// https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/
	// event.detail.data = event of each of these EventSub payloads
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

/* Helpers *******************************************************************/

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
