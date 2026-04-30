import {
	MOCK_BROADCASTER_DETAILS,
	mockTimeStamp,
	mockUserDetails,
	randomMockUser,
} from '@/helpers/mock';
import { sendMockTwitchEvent } from '@/helpers/widgetMessage';
import useTwitchWidgetIds from './useTwitchWidgetIds';

export default function useTwitchMockFollow() {
	const widgetIds = useTwitchWidgetIds();

	function sendCustom(displayName: string) {
		widgetIds.forEach(widgetId => {
			sendMockFollow(widgetId, { displayName });
		});
	}

	function sendRandom() {
		const displayName = randomMockUser('Follower');
		widgetIds.forEach(widgetId => {
			sendMockFollow(widgetId, { displayName });
		});
	}

	return { sendCustom, sendRandom };
}

type MockFollowData = {
	displayName: string;
};

async function sendMockFollow(
	widgetId: string,
	{ displayName }: MockFollowData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);

	const followEvent: Twitch.WebsocketEvent.Follow = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		user_id: mockUser.id,
		user_login: mockUser.login,
		user_name: mockUser.name,
		followed_at: timestamp,
	};

	return sendMockTwitchEvent(
		widgetId,
		'channel.follow',
		'2',
		timestamp,
		followEvent,
	);
}
