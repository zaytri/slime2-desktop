function badgeData(
	set_id: string,
	id: string = '1',
	info: string = '',
): Twitch.Badge {
	return { set_id, id, info };
}

export type TwitchMockBadgeSetId =
	| 'broadcaster'
	| 'lead_moderator'
	| 'moderator'
	| 'vip'
	| 'artist-badge'
	| 'subscriber'
	| 'founder';

export const twitchBadgeMap: Record<TwitchMockBadgeSetId, Twitch.Badge> = {
	broadcaster: badgeData('broadcaster'),
	lead_moderator: badgeData('lead_moderator'),
	moderator: badgeData('moderator'),
	vip: badgeData('vip'),
	'artist-badge': badgeData('artist-badge'),
	subscriber: badgeData('subscriber', '0', '1'),
	founder: badgeData('founder', '0'),
};

export const twitchBadgeImageMap: Record<TwitchMockBadgeSetId, string> = {
	broadcaster:
		'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/3',
	lead_moderator:
		'https://static-cdn.jtvnw.net/badges/v1/0822047b-65e0-46f2-94a9-d1091d685d33/3',
	moderator:
		'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3',
	vip: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/3',
	'artist-badge':
		'https://static-cdn.jtvnw.net/badges/v1/4300a897-03dc-4e83-8c0e-c332fee7057f/3',
	subscriber:
		'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
	founder:
		'https://static-cdn.jtvnw.net/badges/v1/511b78a9-ab37-472f-9569-457753bbe7d3/3',
};

export const TWITCH_MOCK_BADGES: Twitch.Badge[][] = [
	// broadcaster
	[twitchBadgeMap['broadcaster'], twitchBadgeMap['subscriber']],

	// artist
	[twitchBadgeMap['artist-badge']],

	// subscriber/founder,
	// and + artist
	...(['subscriber', 'founder'] satisfies TwitchMockBadgeSetId[]).flatMap(
		sub => {
			return [
				[twitchBadgeMap[sub]],
				[twitchBadgeMap[sub], twitchBadgeMap['artist-badge']],
			];
		},
	),

	// lead moderator/moderator/vip
	// and + artist, and + subscriber/founder,
	// and + subscriber/founder + artist
	...(
		['lead_moderator', 'moderator', 'vip'] satisfies TwitchMockBadgeSetId[]
	).flatMap(role => {
		return [
			[twitchBadgeMap[role]],
			[twitchBadgeMap[role], twitchBadgeMap['artist-badge']],
			...(['subscriber', 'founder'] satisfies TwitchMockBadgeSetId[]).flatMap(
				sub => {
					return [
						[twitchBadgeMap[role], twitchBadgeMap[sub]],
						[
							twitchBadgeMap[role],
							twitchBadgeMap[sub],
							twitchBadgeMap['artist-badge'],
						],
					];
				},
			),
		];
	}),
];

export const TWITCH_MOCK_MESSAGE_TYPES: Twitch.WebsocketEvent.ChatMessage['message_type'][] =
	['text', 'channel_points_highlighted', 'user_intro'];

export const TWITCH_MOCK_MESSAGES: Twitch.Message[] = [
	'hi!',
	'owo?',
	'uwu...',
	'hewwo.',
	'meowdy!!',
	'huh?!',
	'wha!?',
	'yeee',
	'yippee',
].map(text => {
	return {
		text,
		fragments: [{ text, type: 'text' }],
	};
});

export const TWITCH_MOCK_LONG_MESSAGES: Twitch.Message[] = [
	'long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message long test message',
	'LongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessageLongTestMessage',
].map(text => {
	return {
		text,
		fragments: [{ text, type: 'text' }],
	};
});

export const TWITCH_MOCK_EMOTE_FRAGMENTS: Extract<
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

export const TWITCH_MOCK_BITS_TIERS: Twitch.CheerTier[] = [
	1, 100, 1000, 5000, 10000, 100000,
];

export const TWITCH_MOCK_ANNOUNCEMENT_COLORS: Twitch.ChatNoticeType.Announcement['color'][] =
	['PRIMARY', 'BLUE', 'GREEN', 'ORANGE', 'PURPLE'];

export const TWITCH_MOCK_SUB_TIERS: Twitch.SubTier[] = ['1000', '2000', '3000'];

export const TWITCH_MOCK_REWARDS: { name: string; description: string }[] = [
	{ name: 'Hydrate!', description: 'Make me take a sip of water' },
	{ name: 'Posture Check!', description: 'I straighten up - thanks!' },
	{
		name: 'Streeeeeeeeeetch',
		description: 'I stretch and keep my joints happy - thanks!',
	},
	{ name: 'Ad Time', description: 'I play an ad' },
	{ name: 'First!', description: 'You got first!' },
	{ name: 'Lurk', description: 'Just lurking' },
	{ name: 'Daily', description: 'Get your dailies here!' },
];
