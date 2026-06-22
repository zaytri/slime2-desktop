import type { ProxiedMessage, Member, System } from 'pluralmind';
import * as pluralmind from 'pluralmind';

import Random from '@/helpers/random';
import { MOCK_PRONOUNS } from './pronouns';

pluralmind.updateConfig({
    cacheDuration: 5 * 60 * 1000, // 5 minutes
})

export async function getSystemProxiedMessage(
    platform: 'twitch',
    userId: string,
    message: string,
) {
    if (platform !== 'twitch' || !message) return;

    if (userId.startsWith('mock_')) {
        return Random.chance(10) ? makeMockMessage(message) : undefined;
    }

    const system = await pluralmind.getSystem(userId);
    return pluralmind.getProxiedMessage(system, message);
}

function makeMockMessage(message: string): ProxiedMessage {
    const memberId = Random.integer(1, 1000)
    const member: Member = {
        id: memberId,
        name: `MockMember${memberId}`,
        proxies: ['t'],
        case_sensitive: false,
        color: Random.boolean() ? Random.hexCode() : null,
        pronouns: Random.boolean() ? Random.item(MOCK_PRONOUNS).join('/') : null,
    }

    const system: System = {
        id: Random.integer(1, 1000),
        color: null,
        pronouns: null,
        autoproxy_member_id: null,
        members: [member],
    }

    return {
        system,
        member,
        color: member.color,
        pronouns: member.pronouns,
        body: message,
    }
}
