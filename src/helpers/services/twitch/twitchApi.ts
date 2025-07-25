import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Account } from '../../json/accounts';
import twitchAuth from './twitchAuth';
import { TWITCH_CLIENT_ID } from './twitchConstants';

const twitchApiAxios = axios.create({ baseURL: 'https://api.twitch.tv/helix' });

const twitchApi = {
	async getUser(accountId: string, userId?: string) {
		return twitchApiGet<Twitch.ApiResponse.GetUser>(
			'/users',
			accountId,
			userId ? { params: { id: userId } } : undefined,
		);
	},

	async createEventSub(
		account: Account,
		sessionId: string,
		data: {
			type: string;
			version: string;
			condition?: Record<string, string>;
		},
	) {
		return twitchApiPost<Twitch.ApiResponse.CreateEventSub>(
			'/eventsub/subscriptions',
			account.id,
			{
				type: data.type,
				version: data.version,
				condition: data.condition ?? {
					broadcaster_user_id: account.serviceId,
				},
				transport: {
					method: 'websocket',
					session_id: sessionId,
				},
			},
		);
	},

	async getEventSubs(accountId: string, cursor?: string) {
		return twitchApiGet<Twitch.ApiResponse.GetEventSubs>(
			'/eventsub/subscriptions',
			accountId,
			{
				params: { after: cursor },
			},
		);
	},

	async deleteEventSub(accountId: string, subscriptionId: string) {
		return twitchApiDelete('/eventsub/subscriptions', accountId, {
			params: { id: subscriptionId },
		});
	},

	async getCheermotes(accountId: string, broadcasterId?: string) {
		return twitchApiGet<Twitch.ApiResponse.GetCheermotes>(
			'/bits/cheermotes',
			accountId,
			{
				params: { broadcaster_id: broadcasterId },
			},
		);
	},

	async getGlobalBadges(accountId: string) {
		return twitchApiGet<Twitch.ApiResponse.GetBadges>(
			'/chat/badges/global',
			accountId,
		);
	},

	async getChannelChatBadges(accountId: string, broadcasterId: string) {
		return twitchApiGet<Twitch.ApiResponse.GetBadges>(
			'/chat/badges',
			accountId,
			{
				params: { broadcaster_id: broadcasterId },
			},
		);
	},
};

export default twitchApi;

async function authorizedConfig<D = any>(
	accountId: string,
	config?: AxiosRequestConfig<D>,
): Promise<AxiosRequestConfig<D>> {
	const tokens = await twitchAuth.getValidTokens(accountId);

	return {
		...config,
		headers: {
			...config?.headers,
			Authorization: `Bearer ${tokens.accessToken}`,
			'Client-Id': TWITCH_CLIENT_ID,
		},
	};
}

async function twitchApiGet<T = any, R = AxiosResponse<T>, D = any>(
	url: string,
	accountId: string,
	config?: AxiosRequestConfig<D>,
): Promise<R> {
	return twitchApiAxios.get<T, R, D>(
		url,
		await authorizedConfig<D>(accountId, config),
	);
}

async function twitchApiPost<T = any, R = AxiosResponse<T>, D = any>(
	url: string,
	accountId: string,
	data?: D,
	config?: AxiosRequestConfig<D>,
): Promise<R> {
	return twitchApiAxios.post<T, R, D>(
		url,
		data,
		await authorizedConfig<D>(accountId, config),
	);
}

async function twitchApiDelete<T = any, R = AxiosResponse<T>, D = any>(
	url: string,
	accountId: string,
	config?: AxiosRequestConfig<D>,
) {
	return twitchApiAxios.delete<T, R, D>(
		url,
		await authorizedConfig<D>(accountId, config),
	);
}

function createEventSubParams(
	type: string,
	version?: string,
	condition?: Record<string, string>,
) {
	return {
		type,
		version: version ?? '1',
		condition: condition,
	};
}

export function createEventSubParamsList(userId: string) {
	return [
		// chat
		...[
			'channel.chat.clear',
			'channel.chat.clear_user_messages',
			'channel.chat.message',
			'channel.chat.message_delete',
			'channel.chat.notification',
		].map(type =>
			createEventSubParams(type, '1', {
				broadcaster_user_id: userId,
				user_id: userId,
			}),
		),

		// follow
		createEventSubParams('channel.follow', '2', {
			broadcaster_user_id: userId,
			moderator_user_id: userId,
		}),

		// raid
		createEventSubParams('channel.raid', '1', {
			to_broadcaster_user_id: userId,
		}),

		// shoutout
		createEventSubParams('channel.shoutout.create', '1', {
			broadcaster_user_id: userId,
			moderator_user_id: userId,
		}),

		// channel points
		createEventSubParams('channel.channel_points_custom_reward_redemption.add'),
		createEventSubParams(
			'channel.channel_points_automatic_reward_redemption.add',
			'2',
		),

		...[
			// bits
			'channel.bits.use',
			'channel.cheer',

			// ad break
			'channel.ad_break.begin',

			// subscriptions
			'channel.subscribe',
			'channel.subscription.gift',
			'channel.subscription.message',

			// polls
			'channel.poll.begin',
			'channel.poll.progress',
			'channel.poll.end',

			// predictions
			'channel.prediction.begin',
			'channel.prediction.progress',
			'channel.prediction.lock',
			'channel.prediction.end',

			// charity
			'channel.charity_campaign.donate',
			'channel.charity_campaign.start',
			'channel.charity_campaign.progress',
			'channel.charity_campaign.stop',

			// goal
			'channel.goal.begin',
			'channel.goal.progress',
			'channel.goal.end',

			// hype train
			'channel.hype_train.begin',
			'channel.hype_train.progress',
			'channel.hype_train.end',
		].map(type => createEventSubParams(type)),
	];
}
