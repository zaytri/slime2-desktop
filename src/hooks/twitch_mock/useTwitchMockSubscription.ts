import {
	MOCK_BROADCASTER_DETAILS,
	mockTimeStamp,
	mockUserDetails,
	randomMockMessage,
	randomMockUser,
} from '@/helpers/mock';
import Random from '@/helpers/random';
import { sendMockTwitchEvent } from '@/helpers/widgetMessage';
import { TWITCH_MOCK_SUB_TIERS } from './twitchMockData';
import useTwitchWidgetIds from './useTwitchWidgetIds';

export default function useTwitchMockSubscription() {
	const widgetIds = useTwitchWidgetIds();

	function sendCustom(
		displayName: string,
		tier: Twitch.SubTier,
		resub: boolean,
		text: string,
		streakMonths: number,
		totalMonths: number,
		prime: boolean,
	) {
		widgetIds.forEach(widgetId => {
			if (resub) {
				sendMockResub(widgetId, {
					displayName,
					tier,
					text,
					streakMonths,
					totalMonths,
					prime,
				});
			} else {
				sendMockSub(widgetId, {
					displayName,
					tier,
					prime,
				});
			}
		});
	}

	function sendRandom() {
		const displayName = randomMockUser('Subscriber');
		const tier = Random.item(TWITCH_MOCK_SUB_TIERS);
		const resub = Random.boolean();
		const text = randomMockMessage(true).text;
		const totalMonths = Random.integer(2, 100);

		// 50% chance of tier 1 sub being a prime sub
		const prime = tier === '1000' && Random.boolean();

		// 50% chance of no streak
		const streakMonths = Random.boolean()
			? 0
			: // 20% chance of matching totalMonths
				Random.chance(20)
				? totalMonths
				: Random.integer(1, totalMonths);

		widgetIds.forEach(widgetId => {
			if (resub) {
				sendMockResub(widgetId, {
					displayName,
					tier,
					text,
					streakMonths,
					totalMonths,
					prime,
				});
			} else {
				sendMockSub(widgetId, {
					displayName,
					tier,
					prime,
				});
			}
		});
	}

	return { sendCustom, sendRandom };
}

type MockSubData = {
	displayName: string;
	tier: Twitch.SubTier;
	prime: boolean;
};

async function sendMockSub(
	widgetId: string,
	{ displayName, tier, prime }: MockSubData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);

	const subEvent: Twitch.WebsocketEvent.Subscribe = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		user_id: mockUser.id,
		user_login: mockUser.login,
		user_name: mockUser.name,
		tier,
		is_gift: false,
	};

	const subChatNotificationEvent: Twitch.WebsocketEvent.ChatNotification = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		chatter_user_id: mockUser.id,
		chatter_user_login: mockUser.login,
		chatter_user_name: mockUser.name,
		chatter_is_anonymous: false,
		badges: [],
		color: '',
		system_message: 'Mock Subscription',
		message_id: `mock_subscription_${timestamp}`,
		message: { text: '', fragments: [] },
		notice_type: 'sub',
		sub: {
			sub_tier: tier,
			is_prime: prime,
			duration_months: 1,
		},
	};

	return Promise.all([
		sendMockTwitchEvent(
			widgetId,
			'channel.subscribe',
			'1',
			timestamp,
			subEvent,
		),
		sendMockTwitchEvent(
			widgetId,
			'channel.chat.notification',
			'1',
			timestamp,
			subChatNotificationEvent,
		),
	]);
}

type MockResubData = {
	displayName: string;
	tier: Twitch.SubTier;
	totalMonths: number;
	streakMonths: number;
	text: string;
	prime: boolean;
};

async function sendMockResub(
	widgetId: string,
	{ displayName, tier, text, totalMonths, streakMonths, prime }: MockResubData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);

	const resubEvent: Twitch.WebsocketEvent.SubscriptionMessage = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		user_id: mockUser.id,
		user_login: mockUser.login,
		user_name: mockUser.name,
		tier,
		message: { text, emotes: [] },
		cumulative_months: totalMonths,
		duration_months: 1,
		streak_months: streakMonths,
	};

	const resubChatNotificationEvent: Twitch.WebsocketEvent.ChatNotification = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		chatter_user_id: mockUser.id,
		chatter_user_login: mockUser.login,
		chatter_user_name: mockUser.name,
		chatter_is_anonymous: false,
		badges: [],
		color: '',
		system_message: 'Mock Resubscription',
		message_id: `mock_resubscription_${timestamp}`,
		message: { text: '', fragments: [] },
		notice_type: 'resub',
		resub: {
			cumulative_months: totalMonths,
			duration_months: 1,
			streak_months: streakMonths,
			sub_tier: tier,
			is_prime: prime,
			is_gift: false,
			gifter_is_anonymous: true,
		},
	};

	return Promise.all([
		sendMockTwitchEvent(
			widgetId,
			'channel.subscription.message',
			'1',
			timestamp,
			resubEvent,
		),
		sendMockTwitchEvent(
			widgetId,
			'channel.chat.notification',
			'1',
			timestamp,
			resubChatNotificationEvent,
		),
	]);
}
