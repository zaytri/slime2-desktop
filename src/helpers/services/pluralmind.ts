import { ProxyType } from 'pluralmind';
import type { Member, MessageFragment, System } from 'pluralmind';
import * as pluralmind from 'pluralmind';

import Random from '@/helpers/random';
import { randomMockUser } from '../mock';
import { MOCK_PRONOUNS } from './pronouns';

pluralmind.updateConfig({
	cacheDuration: 5 * 60 * 1000, // 5 minutes
});

const MOCK_PROXY_PREFIX = 'm:';

export async function getSystemProxiedMessage(
	platform: 'twitch',
	userId: string,
	message: string | MessageFragment[],
) {
	if (platform !== 'twitch' || !message) return null;

	if (userId.startsWith('mock_')) {
		const system = createMockSystem();
		return pluralmind.getProxiedMessage(system, message) ?? null;
	}

	const system = await pluralmind.getSystem(userId);
	return pluralmind.getProxiedMessage(system, message) ?? null;
}

function createMockSystem(): System {
	const member: Member = {
		id: Random.integer(1, 1000),
		name: randomMockUser('Member'),
		proxies: [{ text: MOCK_PROXY_PREFIX, type: ProxyType.Prefix }],
		case_sensitive: false,
		require_space: true,
		color: Random.boolean() ? Random.hexCode() : null,
		pronouns: Random.boolean() ? Random.item(MOCK_PRONOUNS).join('/') : null,
	};

	return {
		id: Random.integer(1, 1000),
		color: null,
		pronouns: null,
		autoproxy_member_id: null,
		members: [member],
	};
}
