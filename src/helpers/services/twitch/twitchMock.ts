import { Account } from '@/helpers/json/accounts';
import Random from '@/helpers/random';
import { sendTwitchEvent } from '@/helpers/widgetMessage';

export async function mockTwitchChatMessage(
	account: Account,
	widgetId: string,
	_eventOptions?: {},
) {
	if (
		account.type !== 'read' ||
		account.service !== 'twitch' ||
		!account.widgets.includes(widgetId)
	) {
		return;
	}

	const date = new Date();
	const isoString = date.toISOString();

	let displayName = `MockChatter${Random.integer(1, 99)}`;
	if (Random.chance(5)) {
		// 5% chance of xXMockChatter#Xx
		displayName = `xX${displayName}Xx`;
	}

	const message_type = Random.item(MOCK_MESSAGE_TYPES);
	let message: Twitch.WebsocketEvent.ChatMessage['message'] =
		Random.item(MOCK_MESSAGES);

	// 20% chance of single emote
	// (100% if message_type is power_ups_gigantified_emote)
	if (Random.chance(20) || message_type === 'power_ups_gigantified_emote') {
		const emoteFragment = Random.item(MOCK_EMOTE_FRAGMENTS);
		message = {
			text: emoteFragment.text,
			fragments: [emoteFragment],
		};
	} else {
		if (Random.chance(10)) {
			// 10% chance of long message
			message = Random.item(MOCK_LONG_MESSAGES);
		} else if (Random.chance(20)) {
			// 20% chance of triple emote message
			const fragments: Twitch.MessageFragment[] = [
				Random.item(MOCK_EMOTE_FRAGMENTS),
				{ type: 'text', text: ' ' },
				Random.item(MOCK_EMOTE_FRAGMENTS),
				{ type: 'text', text: ' ' },
				Random.item(MOCK_EMOTE_FRAGMENTS),
			];
			message = {
				text: fragments.map(fragment => fragment.text).join(),
				fragments,
			};
		} else if (Random.chance(20)) {
			// 20% chance of adding an emote to the message
			const emoteFragment = Random.item(MOCK_EMOTE_FRAGMENTS);
			message = {
				text: `${message.text} ${emoteFragment.text}`,
				fragments: [{ type: 'text', text: `${message.text} ` }, emoteFragment],
			};
		} else if (Random.chance(20)) {
			// 20% chance of being a cheer
			let bits = Random.integer(1, 99);
			const tier = Random.item(MOCK_BITS_TIER);
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
		broadcaster_user_id: account.serviceId,
		broadcaster_user_login: account.username,
		broadcaster_user_name: account.displayName,
		chatter_user_id: `mock_chatter_${displayName}`,
		chatter_user_name: displayName,
		chatter_user_login: displayName.toLowerCase(),
		badges: Random.boolean() ? [] : Random.item(MOCK_BADGES),
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
	await sendTwitchEvent(
		account.id,
		widgetId,
		`mock_event_${isoString}`,
		'channel.chat.message',
		'1',
		isoString,
		chatMessageEvent,
		true,
	);
}

const MOCK_BADGES: Twitch.Badge[][] = [
	// broadcaster
	[
		{
			id: '1',
			info: '',
			set_id: 'broadcaster',
		},
		{
			id: '0',
			info: '1',
			set_id: 'subscriber',
		},
	],
	// subscriber
	[
		{
			id: '0',
			info: '1',
			set_id: 'subscriber',
		},
	],
	// vip
	[
		{
			id: '1',
			info: '',
			set_id: 'vip',
		},
	],
	// vip subscriber
	[
		{
			id: '1',
			info: '',
			set_id: 'vip',
		},
		{
			id: '0',
			info: '1',
			set_id: 'subscriber',
		},
	],
	// moderator
	[
		{
			id: '1',
			info: '',
			set_id: 'moderator',
		},
	],
	// moderator subscriber
	[
		{
			id: '1',
			info: '',
			set_id: 'moderator',
		},
		{
			id: '0',
			info: '1',
			set_id: 'subscriber',
		},
	],
	// artist
	[
		{
			id: '1',
			info: '',
			set_id: 'artist-badge',
		},
	],
	// artist subscriber
	[
		{
			id: '1',
			info: '',
			set_id: 'artist-badge',
		},
		{
			id: '0',
			info: '1',
			set_id: 'subscriber',
		},
	],
];

const MOCK_MESSAGE_TYPES: Twitch.WebsocketEvent.ChatMessage['message_type'][] =
	[
		'text',
		'channel_points_highlighted',
		'channel_points_sub_only',
		'user_intro',
		'power_ups_message_effect',
		'power_ups_gigantified_emote',
	];

const MOCK_MESSAGES: Twitch.WebsocketEvent.ChatMessage['message'][] = [
	{
		text: 'hi!',
		fragments: [{ text: 'hi!', type: 'text' }],
	},
	{
		text: 'owo?',
		fragments: [{ text: 'owo?', type: 'text' }],
	},
	{
		text: 'uwu...',
		fragments: [{ text: 'uwu...', type: 'text' }],
	},
	{
		text: 'hewwo.',
		fragments: [{ text: 'hewwo.', type: 'text' }],
	},
	{
		text: '😸 meowdy!!',
		fragments: [{ text: '😸 meowdy!!', type: 'text' }],
	},
	{
		text: 'huh?!',
		fragments: [{ text: 'huh?!', type: 'text' }],
	},
	{
		text: 'wha!?',
		fragments: [{ text: 'what!?', type: 'text' }],
	},
];

const MOCK_LONG_MESSAGES: Twitch.WebsocketEvent.ChatMessage['message'][] = [
	{
		text: 'long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test mess',
		fragments: [
			{
				text: 'long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test mess',
				type: 'text',
			},
		],
	},
	{
		text: 'LongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongT',
		fragments: [
			{
				text: 'LongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongTextMessageLongT',
				type: 'text',
			},
		],
	},
];

const MOCK_EMOTE_FRAGMENTS: Extract<
	Twitch.MessageFragment,
	{ type: 'emote' }
>[] = [
	{
		type: 'emote',
		text: ':-)',
		emote: {
			id: '555555557',
			emote_set_id: '0',
			owner_id: 'twitch',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: '<3',
		emote: {
			id: '555555584',
			emote_set_id: '0',
			owner_id: 'twitch',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: ':-D',
		emote: {
			id: '555555561',
			emote_set_id: '0',
			owner_id: 'twitch',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'TwitchUnity',
		emote: {
			id: '196892',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'AsexualPride',
		emote: {
			id: '307827267',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'BisexualPride',
		emote: {
			id: '307827313',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'GayPride',
		emote: {
			id: '307827321',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'GenderFluidPride',
		emote: {
			id: '307827326',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'IntersexPride',
		emote: {
			id: '307827332',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'LesbianPride',
		emote: {
			id: '307827340',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'NonbinaryPride',
		emote: {
			id: '307827356',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'PansexualPride',
		emote: {
			id: '307827370',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'TransgenderPride',
		emote: {
			id: '307827377',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'DinoDance',
		emote: {
			id: 'emotesv2_dcd06b30a5c24f6eb871e8f5edbd44f7',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static', 'animated'],
		},
	},
	{
		type: 'emote',
		text: 'VirtualHug',
		emote: {
			id: '301696583',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
	{
		type: 'emote',
		text: 'bleedPurple',
		emote: {
			id: '62835',
			emote_set_id: '0',
			owner_id: '0',
			format: ['static'],
		},
	},
];

const MOCK_BITS_TIER = [1, 100, 1000, 5000, 10000];
