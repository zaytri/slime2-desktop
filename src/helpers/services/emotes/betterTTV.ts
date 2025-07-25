import axios from 'axios';

const bttvAxios = axios.create({
	baseURL: 'https://api.betterttv.net/3/cached',
});

type BttvEmote = {
	id: string;
	code: string;
	imageType: string;
	animated: boolean;
	userId?: string;
	user?: {
		id: string;
		name: string;
		displayName: string;
		providerId: string;
	};
};

const bttvApi = {
	async getUser(platform: 'twitch' | 'youtube', userId: string) {
		const user = await bttvAxios
			.get<{
				id: string;
				bots: string[];
				avatar: string;
				channelEmotes: BttvEmote[];
				sharedEmotes: BttvEmote[];
			}>(`/users/${platform}/${userId}`)
			.then(response => response.data)
			.catch(() => null);

		if (!user) return null;

		return {
			bots: user.bots,
			emotes: [...user.channelEmotes, ...user.sharedEmotes].map(emote => {
				return {
					id: emote.id,
					code: emote.code,
					imageType: emote.imageType,
					animated: emote.animated,
				};
			}),
		};
	},
};

export default bttvApi;
