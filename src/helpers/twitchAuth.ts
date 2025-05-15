import axios from 'axios';

const TWITCH_READ_SCOPES = [
	'bits:read',
	'channel:read:ads',
	'channel:read:charity',
	'channel:read:goals',
	'channel:read:guest_star',
	'channel:read:hype_train',
	'channel:read:polls',
	'channel:read:predictions',
	'channel:read:redemptions',
	'channel:read:subscriptions',
	'moderator:read:followers',
	'moderator:read:shoutouts',
	'user:read:chat',
];

const TWITCH_CLIENT_ID = 'x94joq8r5wtpajvpdmc95gh03wu6ur';

const twitchAuthApi = axios.create({ baseURL: 'https://id.twitch.tv/oauth2' });

export async function startTwitchDeviceCodeFlow() {
	return twitchAuthApi.post<{
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
}

export async function obtainTwitchTokens(deviceCode: string) {
	return twitchAuthApi.post<{
		access_token: string;
		refresh_token: string;
		expires_in: number;
		scope: string[];
		token_type: 'bearer';
	}>('/token', undefined, {
		params: {
			client_id: TWITCH_CLIENT_ID,
			scopes: TWITCH_READ_SCOPES.join(' '),
			grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
			device_code: deviceCode,
		},
	});
}

export async function verifyToken(accessToken: string) {
	return twitchAuthApi.get<{
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
}

export async function getUser(access_token: string, userId: string) {
	return axios.get<{
		data: {
			id: string;
			login: string;
			display_name: string;
			type: string;
			broadcaster_type: string;
			description: string;
			profile_image_url: string;
			offline_image_url: string;
			created_at: string;
		}[];
	}>('https://api.twitch.tv/helix/users', {
		params: { id: userId },
		headers: {
			Authorization: `Bearer ${access_token}`,
			'Client-Id': TWITCH_CLIENT_ID,
		},
	});
}
