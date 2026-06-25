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

export const POWER_UP_MIN_BITS = 10;
export const POWER_UP_MAX_BITS = 10 * 1000;

export default function useTwitchPowerUp() {
	const widgetIds = useTwitchWidgetIds();

	function sendCustom(
		displayName: string,
		powerUpName: string,
		bits: number,
		description: string,
		userText: string,
	) {
		widgetIds.forEach(widgetId => {
			sendMockPowerUp(widgetId, {
				displayName,
				powerUpName,
				bits,
				description,
				userText,
			});
		});
	}

	function sendRandom() {
		widgetIds.forEach(widgetId => {
			const displayName = randomMockUser('Chatter');
			const reward = Random.item(TWITCH_MOCK_REWARDS);
			const bits = Random.integer(POWER_UP_MIN_BITS, POWER_UP_MAX_BITS);

			sendMockPowerUp(widgetId, {
				displayName,
				powerUpName: reward.name,
				bits,
				description: reward.description,
				userText: '',
			});
		});
	}

	return { sendCustom, sendRandom };
}

type MockRewardData = {
	displayName: string;
	powerUpName: string;
	bits: number;
	description: string;
	userText: string;
};

async function sendMockPowerUp(
	widgetId: string,
	{ displayName, powerUpName, bits, description, userText }: MockRewardData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);

	const powerUpEvent: Twitch.WebsocketEvent.CustomPowerUpRedemption = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		user_id: mockUser.id,
		user_login: mockUser.login,
		user_name: mockUser.name,
		id: `mock_custom_power_up_redemption_${timestamp}`,
		status: 'unfulfilled',
		redeemed_at: timestamp,
		custom_power_up: {
			id: `mock_custom_power_up_${powerUpName}`,
			title: powerUpName,
			bits,
			prompt: description,
		},
		user_input: userText,
	};

	const powerUpBitsUseEvent: Twitch.WebsocketEvent.BitsUse = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		user_id: mockUser.id,
		user_login: mockUser.login,
		user_name: mockUser.name,
		bits,
		message: {
			text: userText,
			fragments: [{ type: 'text', text: userText }],
		},
		type: 'custom_power_up',
		custom_power_up: {
			title: powerUpName,
			reward_id: `mock_custom_power_up_${powerUpName}`,
		},
	};

	return Promise.all([
		sendMockTwitchEvent(
			widgetId,
			'channel.custom_power_up_redemption.add',
			'1',
			timestamp,
			powerUpEvent,
		),
		sendMockTwitchEvent(
			widgetId,
			'channel.bits.use',
			'1',
			timestamp,
			powerUpBitsUseEvent,
		),
	]);
}
