import {
	MOCK_BROADCASTER_DETAILS,
	mockTimeStamp,
	mockUserDetails,
	randomMockUser,
} from '@/helpers/mock';
import Random from '@/helpers/random';
import { sendMockTwitchEvent } from '@/helpers/widgetMessage';
import { TWITCH_MOCK_SUB_TIERS } from './twitchMockData';
import useTwitchWidgetIds from './useTwitchWidgetIds';

export default function useTwitchMockGiftSubscription() {
	const widgetIds = useTwitchWidgetIds();

	function sendCustom(
		anonymous: boolean,
		displayName: string,
		tier: Twitch.SubTier,
		count: number,
		total: number,
	) {
		widgetIds.forEach(widgetId => {
			sendMockGiftSub(widgetId, {
				anonymous,
				displayName,
				tier,
				count,
				total,
			});
		});
	}

	function sendRandom() {
		const displayName = randomMockUser('Gifter');
		const tier = Random.item(TWITCH_MOCK_SUB_TIERS);

		// 50% chance of single gift
		// max gift subs per tier:
		// tier 1: 1000, tier 2: 100, tier 3: 40
		const count = Random.boolean()
			? 1
			: Random.integer(2, tier === '3000' ? 40 : tier === '2000' ? 100 : 1000);

		// at least greater than count
		const total = Random.integer(count, count > 200 ? 10000 : 1000);

		// 20% chance of anonymous
		const anonymous = Random.chance(20);

		widgetIds.forEach(widgetId => {
			sendMockGiftSub(widgetId, {
				anonymous,
				displayName,
				tier,
				count,
				total,
			});
		});
	}

	return { sendCustom, sendRandom };
}

type MockGiftSubData = {
	anonymous: boolean;
	displayName: string;
	tier: Twitch.SubTier;
	count: number;
	total: number;
};

async function sendMockGiftSub(
	widgetId: string,
	{ anonymous, displayName, total, tier, count }: MockGiftSubData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);
	const mockRecipient = mockUserDetails('MockGiftRecipient');

	const subGiftEvent: Twitch.WebsocketEvent.SubscriptionGift = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		is_anonymous: anonymous,
		...(!anonymous && {
			user_id: mockUser.id,
			user_login: mockUser.login,
			user_name: mockUser.name,
			cumulative_total: total,
		}),
		tier,
		total: count,
	};

	const subGiftNotificationEvent: Twitch.WebsocketEvent.ChatNotification = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		chatter_is_anonymous: anonymous,
		...(!anonymous && {
			chatter_user_id: mockUser.id,
			chatter_user_login: mockUser.login,
			chatter_user_name: mockUser.name,
		}),
		badges: [],
		color: '',
		system_message: 'Mock Gift Subscription',
		message_id: `mock_gift_subscription_${timestamp}`,
		message: { text: '', fragments: [] },
		...(count > 1
			? {
					notice_type: 'community_sub_gift',
					community_sub_gift: {
						id: `mock_community_sub_gift_${timestamp}`,
						total: count,
						sub_tier: tier,
						...(!anonymous && {
							cumulative_total: total,
						}),
					},
				}
			: {
					notice_type: 'sub_gift',
					sub_gift: {
						duration_months: 1,
						...(!anonymous && {
							cumulative_total: total,
						}),
						recipient_user_id: mockRecipient.id,
						recipient_user_login: mockRecipient.login,
						recipient_user_name: mockRecipient.name,
						sub_tier: tier,
					},
				}),
	};

	return Promise.all([
		sendMockTwitchEvent(
			widgetId,
			'channel.subscription.gift',
			'1',
			timestamp,
			subGiftEvent,
		),
		sendMockTwitchEvent(
			widgetId,
			'channel.chat.notification',
			'1',
			timestamp,
			subGiftNotificationEvent,
		),
	]);
}
