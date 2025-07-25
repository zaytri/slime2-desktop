import Random from '@/helpers/random';
import alejoPronounsApi from './alejoPronouns';
import pronounDbApi from './pronounDb';

const EXPIRE_TIME = 5 * 60 * 1000; // 5 minutes

const pronounsCache: Map<
	string,
	{
		pronouns: string[] | null;
		expire: number;
	}
> = new Map();

export async function getPronouns(
	platform: 'twitch',
	userId: string,
	username: string,
) {
	if (userId.startsWith('mock_')) {
		return Random.item(MOCK_PRONOUNS);
	}

	const cacheId = `${platform}_${userId}`;
	const cached = pronounsCache.get(cacheId);
	if (cached && Date.now() < cached.expire) {
		return cached.pronouns;
	}

	const [alejoPronouns, pronounDbPronouns] = await Promise.all([
		alejoPronounsApi.getUser(username),
		pronounDbApi.getLookup(platform, userId),
	]);

	const pronouns = alejoPronouns ?? pronounDbPronouns ?? null;
	pronounsCache.set(cacheId, {
		pronouns,
		expire: Date.now() + EXPIRE_TIME,
	});
	return pronouns;
}

const MOCK_PRONOUNS = [
	['ae', 'aer'],
	['any'],
	['e', 'em'],
	['fae', 'faer'],
	['he', 'him'],
	['it', 'its'],
	['other'],
	['per', 'per'],
	['she', 'her'],
	['they', 'them'],
	['ve', 'ver'],
	['xe', 'xem'],
	['zie', 'hir'],
	['she', 'they'],
	['they', 'she'],
	['he', 'they'],
	['they', 'he'],
	['she', 'he'],
	['he', 'she'],
];
