import {
	MOCK_BROADCASTER_DETAILS,
	mockTimeStamp,
	mockUserDetails,
	randomMockMessage,
	randomMockUser,
} from '@/helpers/mock';
import Random from '@/helpers/random';
import { sendMockTwitchEvent } from '@/helpers/widgetMessage';
import {
	TWITCH_MOCK_ANNOUNCEMENT_COLORS,
	TWITCH_MOCK_BADGES,
	TWITCH_MOCK_MESSAGE_TYPES,
} from './twitchMockData';
import useTwitchWidgetIds from './useTwitchWidgetIds';

export default function useTwitchMockChatMessage() {
	const widgetIds = useTwitchWidgetIds();

	function sendCustom(
		displayName: string,
		badges: Twitch.Badge[],
		color: string,
		type: Twitch.WebsocketEvent.ChatMessage['message_type'] | 'announcement',
		text: string,
		announcementColor: Twitch.ChatNoticeType.Announcement['color'],
	) {
		const message: Twitch.Message = {
			text,
			fragments: [{ type: 'text', text }],
		};

		widgetIds.forEach(widgetId => {
			if (type === 'announcement') {
				sendMockAnnouncement(widgetId, {
					displayName,
					badges,
					nameColor: color,
					announcementColor,
					message,
				});
			} else {
				sendMockChatMessage(widgetId, {
					displayName,
					badges,
					color,
					type,
					message,
				});
			}
		});
	}

	function sendRandom() {
		const displayName = randomMockUser('Chatter');

		// 50% chance of no badges
		const badges = Random.boolean() ? [] : Random.item(TWITCH_MOCK_BADGES);

		// 10% chance of no color
		const color = Random.chance(10) ? '' : Random.hexCode();

		const message = randomMockMessage();
		const type:
			| Twitch.WebsocketEvent.ChatMessage['message_type']
			| 'announcement' = Random.item([
			...TWITCH_MOCK_MESSAGE_TYPES,
			'announcement',
		]);
		const announcementColor = Random.item(TWITCH_MOCK_ANNOUNCEMENT_COLORS);

		widgetIds.forEach(widgetId => {
			if (type === 'announcement') {
				sendMockAnnouncement(widgetId, {
					displayName,
					badges,
					nameColor: color,
					announcementColor,
					message,
				});
			} else {
				sendMockChatMessage(widgetId, {
					displayName,
					badges,
					color,
					type,
					message,
				});
			}
		});
	}

	return { sendCustom, sendRandom };
}

type MockChatMessageData = {
	displayName: string;
	badges: Twitch.Badge[];
	color: string;
	type: Twitch.WebsocketEvent.ChatMessage['message_type'];
	message: Twitch.Message;
};

async function sendMockChatMessage(
	widgetId: string,
	{ displayName, badges, color, type, message }: MockChatMessageData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);

	const chatMessageEvent: Twitch.WebsocketEvent.ChatMessage = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		chatter_user_id: mockUser.id,
		chatter_user_login: mockUser.login,
		chatter_user_name: mockUser.name,
		badges,
		color,
		message_id: `mock_message_${timestamp}`,
		message_type: type,
		message,
	};

	const promises = [
		sendMockTwitchEvent(
			widgetId,
			'channel.chat.message',
			'1',
			timestamp,
			chatMessageEvent,
		),
	];

	if (type === 'channel_points_highlighted') {
		const chatHighlightRedeemEvent: Twitch.WebsocketEvent.ChannelPointsAutomaticRewardRedemption =
			{
				broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
				broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
				broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
				user_id: mockUser.id,
				user_login: mockUser.login,
				user_name: mockUser.name,
				id: `mock_highlighted_message_${timestamp}`,
				message,
				redeemed_at: timestamp,
				reward: {
					type: 'send_highlighted_messaage',
					channel_points: 100,
				},
			};

		promises.push(
			sendMockTwitchEvent(
				widgetId,
				'channel.channel_points_automatic_reward_redemption.add',
				'2',
				timestamp,
				chatHighlightRedeemEvent,
			),
		);
	}

	return Promise.all(promises);
}

type MockAnnouncementData = {
	displayName: string;
	badges: Twitch.Badge[];
	nameColor: string;
	announcementColor: Twitch.ChatNoticeType.Announcement['color'];
	message: Twitch.Message;
};

async function sendMockAnnouncement(
	widgetId: string,
	{
		displayName,
		badges,
		nameColor,
		announcementColor,
		message,
	}: MockAnnouncementData,
) {
	const timestamp = mockTimeStamp();
	const mockUser = mockUserDetails(displayName);

	const chatNotificationEvent: Twitch.WebsocketEvent.ChatNotification = {
		broadcaster_user_id: MOCK_BROADCASTER_DETAILS.id,
		broadcaster_user_login: MOCK_BROADCASTER_DETAILS.login,
		broadcaster_user_name: MOCK_BROADCASTER_DETAILS.name,
		chatter_user_id: mockUser.id,
		chatter_user_login: mockUser.login,
		chatter_user_name: mockUser.name,
		chatter_is_anonymous: false,
		badges,
		color: nameColor,
		system_message: '',
		message_id: `mock_announcement_${timestamp}`,
		message,
		notice_type: 'announcement',
		announcement: {
			color: announcementColor,
		},
	};

	return sendMockTwitchEvent(
		widgetId,
		'channel.chat.notification',
		'1',
		timestamp,
		chatNotificationEvent,
	);
}
