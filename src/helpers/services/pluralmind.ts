import type { Member, ProxiedMessage, System } from 'pluralmind';
import * as pluralmind from 'pluralmind';

import Random from '@/helpers/random';
import { randomMockUser } from '../mock';
import { MOCK_PRONOUNS } from './pronouns';

pluralmind.updateConfig({
	cacheDuration: 5 * 60 * 1000, // 5 minutes
});

const MOCK_PROXY_PREFIX = 'm';

export async function getSystemProxiedMessage(
	platform: 'twitch',
	userId: string,
	message: string,
) {
	if (platform !== 'twitch' || !message) return null;

	if (userId.startsWith('mock_')) {
		const fullProxyPrefix = `${MOCK_PROXY_PREFIX}: `;
		return message.startsWith(fullProxyPrefix)
			? mockProxiedMessage(message.substring(fullProxyPrefix.length))
			: null;
	}

	const system = await pluralmind.getSystem(userId);
	return pluralmind.getProxiedMessage(system, message) ?? null;
}

function mockProxiedMessage(body: string): ProxiedMessage {
	const member: Member = {
		id: Random.integer(1, 1000),
		name: randomMockUser('Member'),
		proxies: [MOCK_PROXY_PREFIX],
		case_sensitive: false,
		color: Random.boolean() ? Random.hexCode() : null,
		pronouns: Random.boolean() ? Random.item(MOCK_PRONOUNS).join('/') : null,
	};

	const system: System = {
		id: Random.integer(1, 1000),
		color: null,
		pronouns: null,
		autoproxy_member_id: null,
		members: [member],
	};

	return {
		system,
		member,
		color: member.color,
		pronouns: member.pronouns,
		body,
	};
}
