import useAccounts from '@/contexts/accounts/useAccounts';
import { useBotsLogDispatch } from '@/contexts/bot_logs/useBotLogsDispatch';
import useWidgetMetas from '@/contexts/widget_metas/useWidgetMetas';
import { cacheBust, createTilesUrl } from '@/helpers/serverUrl';
import { getPronouns } from '@/helpers/services/pronouns';
import twitchApi from '@/helpers/services/twitch/twitchApi';
import { getTwitchFollowDate } from '@/helpers/services/twitch/twitchFollowDate';
import logZodError from '@/helpers/zodError';
import { useEffect, useRef } from 'react';
import { z } from 'zod/mini';

export default function useTwitchBot() {
	const accounts = useAccounts();
	const { addBotLog } = useBotsLogDispatch();
	const widgetMetas = useWidgetMetas();
	const twitchBots = useRef(new Map<string, Worker>());

	function disconnectBot(widgetId: string) {
		twitchBots.current.get(widgetId)?.terminate();
		twitchBots.current.delete(widgetId);
	}

	function connectBot(widgetId: string, reconnect: boolean = false) {
		if (twitchBots.current.has(widgetId)) {
			if (reconnect) {
				disconnectBot(widgetId);
			} else {
				return;
			}
		}
		// timestamp for cache busting
		const botScriptUrl = createTilesUrl(widgetId, cacheBust('core/bot.js'));

		// blob is necessary to deal with CORS
		// https://gist.github.com/sterlingwes/077b685c22ad6bdc04464db454b5f9f9
		const blob = new Blob([`importScripts("${botScriptUrl}")`]);

		const bot = new Worker(URL.createObjectURL(blob));

		bot.onmessage = async (
			event: MessageEvent<{ type: string; data: unknown }>,
		) => {
			// return if event is formatted incorrectly
			if (!event.data || !event.data.type || !event.data.data) return;

			const { type, data } = event.data;
			switch (type) {
				case 'send-chat-message': {
					try {
						const {
							account_id,
							broadcaster_id,
							sender_id,
							message,
							reply_parent_message_id,
						} = SendChatMessageData.parse(data);

						twitchApi.sendChatMessage(
							account_id,
							broadcaster_id,
							sender_id,
							message,
							reply_parent_message_id,
						);
					} catch (error) {
						logZodError(error, data);
					}
					break;
				}
				case 'log': {
					try {
						const { message, level } = LogData.parse(data);
						addBotLog(widgetId, JSON.stringify(message, null, '\t'), level);
					} catch (error) {
						logZodError(error, data);
					}
					break;
				}
				case 'request': {
					try {
						const {
							type: requestType,
							request_id,
							payload,
						} = RequestData.parse(data);
						const postMessageType = `slime2:widget-response`;

						switch (requestType) {
							case 'get-pronouns': {
								const { platform, user_id, username } = payload;
								const pronouns = await getPronouns(platform, user_id, username);
								bot.postMessage({
									widgetId,
									type: postMessageType,
									data: {
										request_id,
										type: requestType,
										response: pronouns,
									},
								});
								break;
							}
							case 'get-twitch-follow-date': {
								const { user_id, account_id } = payload;
								const account = accounts[account_id];
								const followDate = account
									? await getTwitchFollowDate(account, user_id)
									: null;
								bot.postMessage({
									widgetId,
									type: postMessageType,
									data: {
										request_id,
										type: requestType,
										response: followDate,
									},
								});
								break;
							}
						}
					} catch (error) {
						logZodError(error, data);
					}
				}
			}
		};

		bot.onerror = event => {
			console.error('Bot Error!', event);
			addBotLog(
				widgetId,
				`[Line: ${event.lineno}, Column: ${event.colno}] ${event.message}`,
				'error',
			);
		};

		// timestamp for cache breaking
		twitchBots.current.set(widgetId, bot);

		dispatchEvent(
			new CustomEvent('bot-registration', { detail: { widgetId } }),
		);
	}

	// bot connection hook
	useEffect(() => {
		// initial bot connect
		Object.entries(widgetMetas).forEach(([widgetId, widgetMeta]) => {
			if (widgetMeta.type.includes('bot')) {
				connectBot(widgetId);
			}
		});

		// disconnect and reconnect bot on core change
		function widgetCoreChangeListener(
			event: CustomEvent<{ widgetId: string }>,
		) {
			const { widgetId } = event.detail;
			if (widgetMetas[widgetId] && widgetMetas[widgetId].type.includes('bot')) {
				connectBot(widgetId, true);
			}
		}

		addEventListener(
			'widget-core-change',
			widgetCoreChangeListener as EventListener,
		);

		return () => {
			removeEventListener(
				'widget-core-change',
				widgetCoreChangeListener as EventListener,
			);
		};
	}, [widgetMetas]);

	// hook for other events
	useEffect(() => {
		const directMessageTypes = [
			'twitch-event',
			'widget-values',
			'widget-accounts',
			'widget-button-click',
		];

		// directly passing the above events into the bots
		function widgetMessageListener(
			event: CustomEvent<{
				widgetId: string;
				data: unknown;
			}>,
		) {
			const { widgetId, data } = event.detail;
			twitchBots.current.get(widgetId)?.postMessage({
				widgetId,
				type: `slime2:${event.type}`,
				data,
			});
		}

		directMessageTypes.forEach(type => {
			addEventListener(type, widgetMessageListener as EventListener);
		});

		// disconnect bot if widget is deleted
		function widgetDeleteListener(event: CustomEvent<{ widgetId: string }>) {
			const { widgetId } = event.detail;
			disconnectBot(widgetId);
		}

		addEventListener('widget-delete', widgetDeleteListener as EventListener);

		return () => {
			directMessageTypes.forEach(type => {
				removeEventListener(type, widgetMessageListener as EventListener);
			});

			removeEventListener(
				'widget-delete',
				widgetDeleteListener as EventListener,
			);
		};
	}, []);
}

const SendChatMessageData = z.object({
	account_id: z.string(),
	broadcaster_id: z.string(),
	sender_id: z.string(),
	message: z.string(),
	reply_parent_message_id: z.optional(z.string()),
});

const LogData = z.object({
	message: z.unknown(),
	level: z.catch(z.literal(['info', 'log', 'error', 'debug', 'warn']), 'log'),
});

const RequestData = z.intersection(
	z.discriminatedUnion('type', [
		z.object({
			type: z.literal('get-pronouns'),
			payload: z.object({
				platform: z.literal('twitch'),
				user_id: z.string(),
				username: z.string(),
			}),
		}),
		z.object({
			type: z.literal('get-twitch-follow-date'),
			payload: z.object({
				account_id: z.string(),
				user_id: z.string(),
			}),
		}),
	]),
	z.object({
		request_id: z.string(),
	}),
);
