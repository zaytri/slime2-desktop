import {
	TWITCH_MOCK_EMOTE_FRAGMENTS,
	TWITCH_MOCK_LONG_MESSAGES,
	TWITCH_MOCK_MESSAGES,
} from '@/hooks/twitch_mock/twitchMockData';
import Random from './random';
import { capitalizeWord } from './string';

export function randomMockUser(baseWord: string) {
	let name = `Mock_${baseWord}${Random.integer(1, 99)}`;

	if (Random.chance(20)) {
		name = Random.boolean() ? name.toLowerCase() : name.toUpperCase();
	}

	if (Random.chance(5)) {
		name = `xX${name}Xx`;
	}

	return name;
}

export function mockTimeStamp() {
	const date = new Date();
	return date.toISOString();
}

const MOCK_BROADCASTER_NAME = 'Mock_Broadcaster';
export const MOCK_BROADCASTER_DETAILS = {
	id: MOCK_BROADCASTER_NAME.toLowerCase(),
	login: MOCK_BROADCASTER_NAME.toLowerCase(),
	name: MOCK_BROADCASTER_NAME,
};

export function mockUserDetails(displayName: string) {
	return {
		id: `mock_user_${displayName.toLowerCase()}`,
		login: displayName.toLowerCase(),
		name: displayName,
	};
}

export function randomMockMessage(textOnly = false): Twitch.Message {
	let message = Random.chance(90)
		? Random.item(TWITCH_MOCK_MESSAGES)
		: Random.item(TWITCH_MOCK_LONG_MESSAGES); // 10% chance of long message

	// 20% chance of capitalizing message
	if (Random.chance(20)) {
		message = {
			text: capitalizeWord(message.text),
			fragments: message.fragments.map(fragment => {
				return {
					...fragment,
					text: capitalizeWord(fragment.text),
				};
			}),
		};
	}

	// 20% chance of uppercasing message
	if (Random.chance(20)) {
		message = {
			text: message.text.toUpperCase(),
			fragments: message.fragments.map(fragment => {
				return {
					...fragment,
					text: fragment.text.toUpperCase(),
				};
			}),
		};
	}

	if (textOnly) {
		return message;
	}

	// 20% chance of adding an emote to the message
	if (Random.chance(20)) {
		const emoteFragment = Random.item(TWITCH_MOCK_EMOTE_FRAGMENTS);
		const fragments: Twitch.MessageFragment[] = [
			{ type: 'text', text: `${message.text} ` },
			emoteFragment,
		];

		message = {
			text: fragments.map(fragment => fragment.text).join(),
			fragments,
		};
	}

	// 20% chance of replacing message with triple emotes
	if (Random.chance(20)) {
		const emoteFragment = Random.item(TWITCH_MOCK_EMOTE_FRAGMENTS);
		const spaceFragment: Twitch.MessageFragment = { type: 'text', text: ' ' };
		const fragments: Twitch.MessageFragment[] = [
			emoteFragment,
			spaceFragment,
			emoteFragment,
			spaceFragment,
			emoteFragment,
		];
		message = {
			text: fragments.map(fragment => fragment.text).join(),
			fragments,
		};
	}

	// 20% chance of replacing message with a single emote
	if (Random.chance(20)) {
		const emoteFragment = Random.item(TWITCH_MOCK_EMOTE_FRAGMENTS);
		message = {
			text: emoteFragment.text,
			fragments: [emoteFragment],
		};
	}

	return message;
}
