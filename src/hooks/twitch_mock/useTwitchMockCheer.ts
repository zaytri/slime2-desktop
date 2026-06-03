import {
	MOCK_BROADCASTER_DETAILS,
	mockTimeStamp,
	mockUserDetails,
	randomMockMessage,
	randomMockUser,
} from '@/helpers/mock';
import Random from '@/helpers/random';
import { sendMockTwitchEvent } from '@/helpers/widgetMessage';
import { TWITCH_MOCK_BADGES } from './twitchMockData';
import useTwitchWidgetIds from './useTwitchWidgetIds';

export default function useTwitchMockCheer() {
	const widgetIds = useTwitchWidgetIds();

	function sendCustom(
		displayName: string,
		badges: Twitch.Badge[],
		color: string,
		bits: number,
		text: string,
	) {
		widgetIds.forEach(widgetId => {
			sendMockCheer(widgetId, {
				displayName,
				badges,
				color,
				bits,
				text,
			});
		});
	}

	function sendRandom() {
		widgetIds.forEach(widgetId => {
			const displayName = randomMockUser('Chatter');
			const text = randomMockMessage(true).text;

			const bits = Random.item([
				Random.integer(1, 99),
				Random.integer(100, 999),
				Random.integer(1000, 4999),
				Random.integer(5000, 9999),
				Random.integer(10000, 99999),
				// change to 100,000 when Twitch fixes the Cheermotes API
				// https://github.com/twitchdev/issues/issues/1163#issuecomment-4595389781
				99999,
			]);

			// 50% chance of no badges
			const badges = Random.boolean() ? [] : Random.item(TWITCH_MOCK_BADGES);

			// 10% chance of no color
			const color = Random.chance(10) ? '' : Random.hexCode();

			sendMockCheer(widgetId, {
				displayName,
				badges,
				color,
				bits,
				text,
			});
		});
	}

	return { sendCustom, sendRandom };
}

type MockCheerData = {
	displayName: string;
	badges: Twitch.Badge[];
	color: string;
	bits: number;
	text: string;
};

async function sendMockCheer(
	widgetId: string,
	{ displayName, bits, text, badges, color }: MockCheerData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);

	let tier: Twitch.CheerTier = 1;
	if (bits === 100000) {
		tier = 100000;
	} else if (bits >= 10000) {
		tier = 10000;
	} else if (bits >= 5000) {
		tier = 5000;
	} else if (bits >= 1000) {
		tier = 1000;
	} else if (bits >= 100) {
		tier = 100;
	}

	const prefix = 'Cheer';
	const cheermoteText = `${prefix}${bits}`;
	const message: Twitch.Message = {
		text: `${cheermoteText} ${text}`,
		fragments: [
			{
				type: 'cheermote',
				text: cheermoteText,
				cheermote: { prefix: prefix.toLowerCase(), bits, tier },
			},
			{
				type: 'text',
				text: ` ${text}`,
			},
		],
	};

	const cheerEvent: Twitch.WebsocketEvent.Cheer = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		user_id: mockUser.id,
		user_login: mockUser.login,
		user_name: mockUser.name,
		is_anonymous: false,
		message: text,
		bits,
	};

	const cheerBitsUseEvent: Twitch.WebsocketEvent.BitsUse = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		user_id: mockUser.id,
		user_login: mockUser.login,
		user_name: mockUser.name,
		bits,
		message,
		type: 'cheer',
	};

	const cheerMessageEvent: Twitch.WebsocketEvent.ChatMessage = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		chatter_user_id: mockUser.id,
		chatter_user_login: mockUser.login,
		chatter_user_name: mockUser.name,
		badges,
		color,
		message_id: `mock_cheer_${timestamp}`,
		message_type: 'text',
		message,
		cheer: {
			bits,
		},
	};

	return Promise.all([
		sendMockTwitchEvent(widgetId, 'channel.cheer', '1', timestamp, cheerEvent),
		sendMockTwitchEvent(
			widgetId,
			'channel.bits.use',
			'1',
			timestamp,
			cheerBitsUseEvent,
		),
		sendMockTwitchEvent(
			widgetId,
			'channel.chat.message',
			'1',
			timestamp,
			cheerMessageEvent,
		),
	]);
}
