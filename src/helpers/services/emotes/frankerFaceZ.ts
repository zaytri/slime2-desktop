import axios from 'axios';

const ffzAxios = axios.create({
	baseURL: 'https://api.frankerfacez.com/v1',
});

type FfzImageUrls = {
	// 1 is guaranteed, 2 and 4 aren't
	'1': string;
	'2': string | null;
	'4': string | null;
};

const ffzApi = {
	async getRoom(platform: 'twitch' | 'youtube', userId: string) {
		const roomType = platform === 'youtube' ? 'yt' : 'id';
		const data = await ffzAxios
			.get<{
				room: {
					_id: number; // ffz user id
					twitch_id: number;
					youtube_id: string | null;
					id: string; // platform username
					is_group: boolean;
					display_name: string | null; // platform display name
					set: number;
					moderator_badge: string | null;
					vip_badge: FfzImageUrls | null;
					mod_urls: FfzImageUrls | null;
					user_badges: Record<string, string[]>;
					user_badge_ids: Record<string, number[]>;
					css: string | null;
				};
				sets: Record<
					string,
					{
						id: number;
						_type: number;
						icon: string | null;
						title: string | null;
						css: string | null;
						emoticons: {
							id: number;
							name: string;
							height: number;
							width: number;
							public: boolean;
							hidden: boolean;
							modifier: boolean;
							modifier_flags: number;
							offset: string | null;
							margins: string | null;
							css: string | null;
							owner: {
								_id: number;
								name: string;
								display_name: string | null;
							} | null;
							artist: {
								_id: number;
								name: string;
								display_name: string | null;
							} | null;
							urls: FfzImageUrls;
							animated?: FfzImageUrls | null;
							mask?: FfzImageUrls | null;
							mask_animated?: FfzImageUrls | null;
							status: number;
							usage_count: number;
							created_at: string;
							last_updated: string | null;
						}[];
					}
				>;
			}>(`/room/${roomType}/${userId}`)
			.then(response => response.data)
			.catch(() => null);

		if (!data || !data.sets || !data.room) return null;
		const { room, sets } = data;

		const roomSet = sets[room.set];

		return {
			moderator_badge: room.moderator_badge,
			vip_badge: room.vip_badge,
			mod_urls: room.mod_urls,
			user_badges: room.user_badges,
			user_badge_ids: room.user_badge_ids,
			emotes: roomSet
				? roomSet.emoticons.map(emote => {
						return {
							id: emote.id,
							name: emote.name,
							height: emote.height,
							width: emote.width,
							urls: emote.urls,
							animated: emote.animated,
						};
					})
				: [],
		};
	},
};

export default ffzApi;
