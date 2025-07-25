import axios from 'axios';
import {
	deleteTokens,
	getTokens,
	setTokens,
	Tokens,
} from '../../json/accounts';
import { TWITCH_CLIENT_ID, TWITCH_READ_SCOPES } from './twitchConstants';

const ONE_HOUR = 1000 * 60 * 60; // in milliseconds

const twitchAuthAxios = axios.create({
	baseURL: 'https://id.twitch.tv/oauth2',
});

// DCF = Device Code Grant Flow
// https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#device-code-grant-flow

const twitchAuth = {
	async startDCF() {
		return twitchAuthAxios.post<{
			device_code: string;
			expires_in: number;
			interval: number;
			user_code: string;
			verification_uri: string;
		}>('/device', undefined, {
			params: {
				client_id: TWITCH_CLIENT_ID,
				scopes: TWITCH_READ_SCOPES.join(' '),
			},
		});
	},

	async obtainDCFTokens(deviceCode: string) {
		return twitchAuthAxios.post<{
			access_token: string;
			refresh_token: string;
			expires_in: number;
			scope: string[];
			token_type: string;
		}>('/token', undefined, {
			params: {
				client_id: TWITCH_CLIENT_ID,
				scopes: TWITCH_READ_SCOPES.join(' '),
				grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
				device_code: deviceCode,
			},
		});
	},

	async validateAccessToken(accessToken: string) {
		return twitchAuthAxios.get<{
			client_id: string;
			login: string;
			scopes: string[];
			user_id: string;
			expires_in: number;
		}>('/validate', {
			headers: {
				Authorization: `OAuth ${accessToken}`,
			},
		});
	},

	async refreshAccessToken(refreshToken: string) {
		return twitchAuthAxios.post<{
			access_token: string;
			refresh_token: string;
			scope: string[];
			token_type: string;
		}>('/token', undefined, {
			params: {
				client_id: TWITCH_CLIENT_ID,
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			},
		});
	},

	async getValidTokens(accountId: string): Promise<Tokens> {
		// throws if tokens don't exist
		const tokens = await getTokens(accountId);

		// need to validate token every hour
		if (Date.now() - tokens.validatedAt > ONE_HOUR) {
			try {
				await twitchAuth.validateAccessToken(tokens.accessToken);
			} catch (error) {
				console.error(
					`Twitch Access Token for ${accountId} no longer valid! Refreshing...`,
					error,
				);

				// access token might be expired, refresh it
				try {
					const { data } = await twitchAuth.refreshAccessToken(
						tokens.refreshToken,
					);

					const newTokens = await setTokens(
						accountId,
						data.access_token,
						data.refresh_token,
					);

					return newTokens;
				} catch (error) {
					console.error(`Twitch Access Token could not be refreshed!`, error);

					// access token likely revoked, delete the tokens
					deleteTokens(accountId);

					throw error;
				}
			}
		}

		return tokens;
	},
};

export default twitchAuth;
