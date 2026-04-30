import {
	MOCK_BROADCASTER_DETAILS,
	mockTimeStamp,
	mockUserDetails,
	randomMockUser,
} from '@/helpers/mock';
import Random from '@/helpers/random';
import { sendMockTwitchEvent } from '@/helpers/widgetMessage';
import useTwitchWidgetIds from './useTwitchWidgetIds';

export default function useTwitchMockRaid() {
	const widgetIds = useTwitchWidgetIds();

	function sendCustom(displayName: string, viewers: number) {
		widgetIds.forEach(widgetId => {
			sendMockRaid(widgetId, { displayName, viewers });
		});
	}

	function sendRandom() {
		const displayName = randomMockUser('Raider');
		const viewers = Random.integer(1, 1000);

		widgetIds.forEach(widgetId => {
			sendMockRaid(widgetId, { displayName, viewers });
		});
	}

	return { sendCustom, sendRandom };
}

type MockRaidData = {
	displayName: string;
	viewers: number;
};

async function sendMockRaid(
	widgetId: string,
	{ displayName, viewers }: MockRaidData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);

	const raidEvent: Twitch.WebsocketEvent.Raid = {
		from_broadcaster_user_id: mockUser.id,
		from_broadcaster_user_login: mockUser.login,
		from_broadcaster_user_name: mockUser.name,
		to_broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		to_broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		to_broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		viewers,
	};

	const raidNotificationEvent: Twitch.WebsocketEvent.ChatNotification = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		chatter_user_id: mockUser.id,
		chatter_user_login: mockUser.login,
		chatter_user_name: mockUser.name,
		chatter_is_anonymous: false,
		badges: [],
		color: '',
		system_message: 'Mock Raid',
		message_id: `mock_raid_${timestamp}`,
		message: { text: '', fragments: [] },
		notice_type: 'raid',
		raid: {
			user_id: mockUser.id,
			user_login: mockUser.login,
			user_name: mockUser.name,
			viewer_count: viewers,
			profile_image_url: '',
		},
	};

	return Promise.all([
		sendMockTwitchEvent(widgetId, 'channel.raid', '1', timestamp, raidEvent),
		sendMockTwitchEvent(
			widgetId,
			'channel.chat.notification',
			'1',
			timestamp,
			raidNotificationEvent,
		),
	]);
}
