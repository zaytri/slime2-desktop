import Random from '@/helpers/random';
import { sendTwitchEvent } from '@/helpers/widgetMessage';
import {
	TWITCH_MOCK_BADGES,
	TWITCH_MOCK_BITS_TIER,
	TWITCH_MOCK_EMOTE_FRAGMENTS,
	TWITCH_MOCK_LONG_MESSAGES,
	TWITCH_MOCK_MESSAGE_TYPES,
	TWITCH_MOCK_MESSAGES,
} from '../../../hooks/twitch_mock/twitchMockData';

export function twitchMockChatMessage(
	widgetId: string,
	custom?: {
		name: string;
		badges: Twitch.Badge[];
		color: string;
		type: Twitch.WebsocketEvent.ChatMessage['message_type'];
		text: string;
	},
) {
	const date = new Date();
	const isoString = date.toISOString();

	let displayName = `MockChatter${Random.integer(1, 99)}`;
	if (Random.chance(5)) {
		// 5% chance of xXMockChatter#Xx
		displayName = `xX${displayName}Xx`;
	}

	const message_type = Random.item(TWITCH_MOCK_MESSAGE_TYPES);
	let message: Twitch.WebsocketEvent.ChatMessage['message'] =
		Random.item(TWITCH_MOCK_MESSAGES);

	// 20% chance of single emote
	// (100% if message_type is power_ups_gigantified_emote)
	if (Random.chance(20) || message_type === 'power_ups_gigantified_emote') {
		const emoteFragment = Random.item(TWITCH_MOCK_EMOTE_FRAGMENTS);
		message = {
			text: emoteFragment.text,
			fragments: [emoteFragment],
		};
	} else {
		if (Random.chance(10)) {
			// 10% chance of long message
			message = Random.item(TWITCH_MOCK_LONG_MESSAGES);
		} else if (Random.chance(20)) {
			// 20% chance of triple emote message
			const fragments: Twitch.MessageFragment[] = [
				Random.item(TWITCH_MOCK_EMOTE_FRAGMENTS),
				{ type: 'text', text: ' ' },
				Random.item(TWITCH_MOCK_EMOTE_FRAGMENTS),
				{ type: 'text', text: ' ' },
				Random.item(TWITCH_MOCK_EMOTE_FRAGMENTS),
			];
			message = {
				text: fragments.map(fragment => fragment.text).join(),
				fragments,
			};
		} else if (Random.chance(20)) {
			// 20% chance of adding an emote to the message
			const emoteFragment = Random.item(TWITCH_MOCK_EMOTE_FRAGMENTS);
			message = {
				text: `${message.text} ${emoteFragment.text}`,
				fragments: [{ type: 'text', text: `${message.text} ` }, emoteFragment],
			};
		} else if (Random.chance(20)) {
			// 20% chance of being a cheer
			let bits = Random.integer(1, 99);
			const tier = Random.item(TWITCH_MOCK_BITS_TIER);
			switch (tier) {
				case 100:
					bits = Random.integer(100, 999);
					break;
				case 1000:
					bits = Random.integer(1000, 4999);
					break;
				case 5000:
					bits = Random.integer(5000, 9999);
					break;
				case 10000:
					bits = 10000;
					break;
			}
			const prefix = 'Cheer';
			const text = `${prefix}${bits}`;
			message = {
				text,
				fragments: [
					{
						type: 'cheermote',
						text,
						cheermote: { prefix, bits, tier },
					},
				],
			};
		}
	}

	const chatMessageEvent: Twitch.WebsocketEvent.ChatMessage = {
		broadcaster_user_id: 'mock_event',
		broadcaster_user_login: 'mock_event',
		broadcaster_user_name: 'Mock_Event',
		chatter_user_id: `mock_chatter_${displayName}`,
		chatter_user_name: displayName,
		chatter_user_login: displayName.toLowerCase(),
		badges: Random.boolean() ? [] : Random.item(TWITCH_MOCK_BADGES),
		color: Random.chance(10) ? '' : Random.hexCode(),
		message_id: `mock_message_${isoString}`,
		message_type,
		message,
		...(message.fragments[0].type === 'cheermote' && {
			cheer: {
				bits: message.fragments[0].cheermote.bits,
			},
		}),
	};

	sendTwitchEvent(
		'mock_event',
		widgetId,
		`mock_event_${isoString}`,
		'channel.chat.message',
		'1',
		isoString,
		chatMessageEvent,
		true,
	);
}
