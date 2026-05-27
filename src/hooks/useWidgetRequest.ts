import useAccounts from '@/contexts/accounts/useAccounts';
import { useBotsLogDispatch } from '@/contexts/bot_logs/useBotLogsDispatch';
import bttvApi from '@/helpers/services/emotes/betterTTV';
import ffzApi from '@/helpers/services/emotes/frankerFaceZ';
import { getPronouns } from '@/helpers/services/pronouns';
import twitchApi from '@/helpers/services/twitch/twitchApi';
import { getTwitchFollowDate } from '@/helpers/services/twitch/twitchFollowDate';
import { capitalizeWord } from '@/helpers/string';
import { sendWidgetResponse, sendWidgetValues } from '@/helpers/widgetMessage';
import logZodError from '@/helpers/zodError';
import type { Account } from '@@/json/accounts';
import { loadWidgetSettings } from '@@/json/widgetSettings';
import {
	loadWidgetValues,
	saveWidgetValues,
	WidgetValuesZ,
	type WidgetValues,
} from '@@/json/widgetValues';
import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import { z } from 'zod/mini';

const COMBINED_REQUEST_EVENT_TYPE = 'widget-request';

export default function useWidgetRequest() {
	const accounts = useAccounts();
	const { addBotLog } = useBotsLogDispatch();

	// take in the requests from the bots/overlays and push them into new event
	useEffect(() => {
		function botRequestListener(event: CustomEventInit<WidgetRequest>) {
			dispatchEvent(
				new CustomEvent(COMBINED_REQUEST_EVENT_TYPE, { detail: event.detail }),
			);
		}

		addEventListener('bot-request', botRequestListener);

		const unlistenPromise = listen<z.infer<typeof WidgetRequestZ>>(
			'websocket-request',
			event => {
				dispatchEvent(
					new CustomEvent(COMBINED_REQUEST_EVENT_TYPE, {
						detail: event.payload,
					}),
				);
			},
		);

		return () => {
			removeEventListener('bot-request', botRequestListener);

			unlistenPromise.then(unlisten => {
				if (unlisten) unlisten();
			});
		};
	}, []);

	useEffect(() => {
		async function requestListener(event: CustomEventInit<WidgetRequest>) {
			try {
				const request = WidgetRequestZ.parse(event.detail);
				const { widget_id, request_id, request_type, account_id } = request;
				const account = accounts[account_id];
				if (!account)
					throw new Error(`Slime2 account with ID ${account_id} not found!`);

				function respond(response: unknown) {
					sendWidgetResponse(widget_id, request_type, request_id, response);
				}

				function accountError(
					service: Account['service'],
					type: Account['type'],
				) {
					return `Account Error: Only ${capitalizeWord(service)} ${capitalizeWord(type)} accounts can request [${request.request_type}]!`;
				}

				switch (request.request_type) {
					case 'get-pronouns': {
						const { platform, user_id, username } = request.payload;
						const pronouns = await getPronouns(platform, user_id, username);
						respond(pronouns);
						break;
					}
					case 'get-twitch-follow-date': {
						if (account.type !== 'read' || account.service !== 'twitch') {
							throw new Error(accountError('twitch', 'read'));
						}

						const { user_id } = request.payload;
						const followDate = await getTwitchFollowDate(account, user_id);
						respond(followDate);
						break;
					}
					case 'get-twitch-cheermotes': {
						const cheermotes = await twitchApi.getCheermotes(
							account.id,
							account.serviceId,
						);
						if (account.type !== 'read' || account.service !== 'twitch') {
							throw new Error(accountError('twitch', 'read'));
						}

						respond(cheermotes.data.data);
						break;
					}
					case 'get-twitch-global-badges': {
						const globalBadges = await twitchApi.getGlobalBadges(account.id);
						respond(globalBadges.data.data);
						break;
					}
					case 'get-twitch-channel-chat-badges': {
						if (account.type !== 'read' || account.service !== 'twitch') {
							throw new Error(accountError('twitch', 'read'));
						}

						const channelBadges = await twitchApi.getChannelChatBadges(
							account.id,
							account.serviceId,
						);
						respond(channelBadges.data.data);
						break;
					}
					case 'post-twitch-chat-message': {
						if (account.type !== 'bot' || account.service !== 'twitch') {
							throw new Error(accountError('twitch', 'bot'));
						}

						const { broadcaster_id, message, reply_parent_message_id } =
							request.payload;

						const chatMessageResponse = await twitchApi.sendChatMessage(
							account.id,
							broadcaster_id,
							account.serviceId,
							message,
							reply_parent_message_id,
						);

						respond(chatMessageResponse.data.data[0]);
						break;
					}
					case 'get-betterttv-user': {
						const { platform } = request.payload;
						const bttv = await bttvApi.getUser(platform, account.serviceId);
						respond(bttv);
						break;
					}
					case 'get-frankerfacez-room': {
						const { platform } = request.payload;
						const ffz = await ffzApi.getRoom(platform, account.serviceId);
						respond(ffz);
						break;
					}
					case 'post-slime2-values': {
						const sentValues = request.payload;

						// load settings and values from json
						const [settings, values] = await Promise.all([
							loadWidgetSettings(widget_id),
							loadWidgetValues(widget_id),
						]);
						const newValues: WidgetValues = {
							...structuredClone(values),
							...structuredClone(sentValues),
						};

						// send to widget and save to json
						await Promise.all([
							sendWidgetValues(widget_id, settings, newValues),
							saveWidgetValues(widget_id, newValues),
						]);

						// send to widget values provider
						dispatchEvent(
							new CustomEvent('update-values', {
								detail: { widget_id, values: newValues },
							}),
						);

						respond({ success: true });
						break;
					}
					default:
						throw Error('Unhandled request type!');
				}
			} catch (error) {
				const formattedError = logZodError(error, event.detail);

				const requestType = event.detail?.request_type;
				const widgetId = event.detail?.widget_id;
				const requestId = event.detail?.request_id;

				if (widgetId) {
					addBotLog(
						widgetId,
						[`[slime2:request - ${requestType}]`, formattedError],
						'error',
					);

					if (requestType && requestId) {
						sendWidgetResponse(widgetId, requestType, requestId, {
							error: formattedError,
						});
					}
				}
			}
		}

		addEventListener(COMBINED_REQUEST_EVENT_TYPE, requestListener);

		return () => {
			removeEventListener(COMBINED_REQUEST_EVENT_TYPE, requestListener);
		};
	}, [accounts]);
}

const FollowDateRequestZ = z.object({
	request_type: z.literal('get-twitch-follow-date'),
	payload: z.object({
		user_id: z.string(),
	}),
});

const PronounsRequestZ = z.object({
	request_type: z.literal('get-pronouns'),
	payload: z.object({
		platform: z.literal('twitch'),
		user_id: z.string(),
		username: z.string(),
	}),
});

const PlatformRequestZ = z.object({
	request_type: z.literal(['get-betterttv-user', 'get-frankerfacez-room']),
	payload: z.object({
		platform: z.literal('twitch'),
	}),
});

const AccountRequestZ = z.object({
	request_type: z.literal([
		'get-twitch-cheermotes',
		'get-twitch-global-badges',
		'get-twitch-channel-chat-badges',
	]),
});

const ChatMessageRequestZ = z.object({
	request_type: z.literal('post-twitch-chat-message'),
	payload: z.object({
		broadcaster_id: z.string(),
		message: z.string(),
		reply_parent_message_id: z.string(),
	}),
});

const ValuesRequestZ = z.object({
	request_type: z.literal('post-slime2-values'),
	payload: WidgetValuesZ,
});

const WidgetRequestZ = z.intersection(
	z.object({
		request_id: z.string(),
		widget_id: z.string(),
		account_id: z.string(),
	}),
	z.discriminatedUnion('request_type', [
		PronounsRequestZ,
		FollowDateRequestZ,
		AccountRequestZ,
		PlatformRequestZ,
		ChatMessageRequestZ,
		ValuesRequestZ,
	]),
);

export type WidgetRequest = z.infer<typeof WidgetRequestZ>;
