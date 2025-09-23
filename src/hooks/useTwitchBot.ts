import useWidgetMetas from '@/contexts/widget_metas/useWidgetMetas';
import serverBaseUrl from '@/helpers/serverBaseUrl';
import twitchApi from '@/helpers/services/twitch/twitchApi';
import logZodError from '@/helpers/zodError';
import { useEffect, useRef } from 'react';
import { z } from 'zod/mini';

export default function useTwitchBot() {
	const widgetMetas = useWidgetMetas();
	const twitchBots = useRef(new Map<string, Worker>());

	function disconnectBot(widgetId: string) {
		twitchBots.current.get(widgetId)?.terminate();
		twitchBots.current.delete(widgetId);
	}

	function connectBot(
		widgetId: string,
		botPath: string,
		reconnect: boolean = false,
	) {
		if (twitchBots.current.has(widgetId)) {
			if (reconnect) {
				disconnectBot(widgetId);
			} else {
				return;
			}
		}
		// timestamp for cache busting
		const botScriptUrl = `${serverBaseUrl.tiles}/tile/${widgetId}/core/${botPath}?timestamp=${Date.now()}`;

		// blob is necessary to deal with CORS
		// https://gist.github.com/sterlingwes/077b685c22ad6bdc04464db454b5f9f9
		const blob = new Blob([`importScripts("${botScriptUrl}")`]);

		const bot = new Worker(URL.createObjectURL(blob));

		bot.onmessage = (event: MessageEvent<{ type: string; data: unknown }>) => {
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
			}
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
			if (widgetMeta.bot) {
				connectBot(widgetId, widgetMeta.bot);
			}
		});

		// disconnect and reconnect bot on core change
		function widgetCoreChangeListener(
			event: CustomEvent<{ widgetId: string }>,
		) {
			const { widgetId } = event.detail;
			const botPath = widgetMetas[widgetId]?.bot;
			if (botPath) {
				connectBot(widgetId, botPath, true);
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
			'widget-response',
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
