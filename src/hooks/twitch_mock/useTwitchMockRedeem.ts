import {
	MOCK_BROADCASTER_DETAILS,
	mockTimeStamp,
	mockUserDetails,
	randomMockUser,
} from '@/helpers/mock';
import Random from '@/helpers/random';
import { sendMockTwitchEvent } from '@/helpers/widgetMessage';
import { TWITCH_MOCK_REWARDS } from './twitchMockData';
import useTwitchWidgetIds from './useTwitchWidgetIds';

export default function useTwitchMockRedeem() {
	const widgetIds = useTwitchWidgetIds();

	function sendCustom(
		displayName: string,
		rewardName: string,
		cost: number,
		description: string,
		userText: string,
	) {
		widgetIds.forEach(widgetId => {
			sendMockRedeem(widgetId, {
				displayName,
				rewardName,
				cost,
				description,
				userText,
			});
		});
	}

	function sendRandom() {
		widgetIds.forEach(widgetId => {
			const displayName = randomMockUser('Chatter');
			const reward = Random.item(TWITCH_MOCK_REWARDS);
			const cost = Random.integer(1, 1000 * 1000);

			sendMockRedeem(widgetId, {
				displayName,
				rewardName: reward.name,
				cost,
				description: reward.description,
				userText: '',
			});
		});
	}

	return { sendCustom, sendRandom };
}

type MockRedeemData = {
	displayName: string;
	rewardName: string;
	cost: number;
	description: string;
	userText: string;
};

async function sendMockRedeem(
	widgetId: string,
	{ displayName, rewardName, cost, description, userText }: MockRedeemData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);

	const redemptionEvent: Twitch.WebsocketEvent.ChannelPointsCustomRewardRedemption =
		{
			broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
			broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
			broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
			user_id: mockUser.id,
			user_login: mockUser.login,
			user_name: mockUser.name,
			id: `mock_channel_points_redemption_${timestamp}`,
			status: 'unfulfilled',
			redeemed_at: timestamp,
			reward: {
				id: `mock_channel_points_reward_${rewardName}`,
				title: rewardName,
				cost,
				prompt: description,
			},
			user_input: userText,
		};

	return sendMockTwitchEvent(
		widgetId,
		'channel.channel_points_custom_reward_redemption.add',
		'1',
		timestamp,
		redemptionEvent,
	);
}
