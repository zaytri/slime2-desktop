import type { Account } from '@@/json/accounts';
import twitchApi from './twitchApi';

const EXPIRE_TIME = 5 * 60 * 1000; // 5 minutes
const EPOCH_DATE = new Date(0);

const followCache: Map<
	string,
	{
		followDate: string | null;
		expire: number;
	}
> = new Map();

export async function getTwitchFollowDate(account: Account, userId: string) {
	if (account.serviceId === userId || userId.startsWith('mock_')) {
		return EPOCH_DATE.toISOString();
	}

	const cacheId = `${account.id}_${userId}`;
	const cached = followCache.get(cacheId);
	if (cached && Date.now() < cached.expire) {
		return cached.followDate;
	}

	const followResponse = await twitchApi.getChannelFollower(
		account.id,
		account.serviceId,
		userId,
	);
	const [followData] = followResponse.data.data;

	const followDate = followData ? followData.followed_at : null;
	followCache.set(cacheId, {
		followDate,
		expire: Date.now() + EXPIRE_TIME,
	});
	return followDate;
}
