import { useBotsLogDispatch } from '@/contexts/bot_logs/useBotLogsDispatch';
import { useSettings } from '@/contexts/settings/useSettings';
import useWidgetMetas from '@/contexts/widget_metas/useWidgetMetas';
import { cacheBust, createTilesUrl } from '@/helpers/serverUrl';
import logZodError from '@/helpers/zodError';
import { useEffect, useRef } from 'react';
import { z, type JSONType } from 'zod/mini';

export default function useTwitchBot() {
	const { addBotLog } = useBotsLogDispatch();
	const widgetMetas = useWidgetMetas();
	const { settings } = useSettings();
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
			event: MessageEvent<{ type: string; data: Record<string, unknown> }>,
		) => {
			// return if event is formatted incorrectly
			if (!event.data || !event.data.type || !event.data.data) return;

			const { type, data } = event.data;
			try {
				switch (type) {
					case 'slime2:log': {
						const { data: logData, level } = LogData.parse(data);
						addBotLog(widgetId, logData, level);

						break;
					}
					case 'slime2:request': {
						dispatchEvent(
							new CustomEvent('bot-request', {
								detail: { ...data, widget_id: widgetId },
							}),
						);
						break;
					}
				}
			} catch (error) {
				const formattedError = logZodError(error, data);
				addBotLog(widgetId, [`[${type}]`, formattedError], 'error');
			}
		};

		bot.onerror = event => {
			addBotLog(
				widgetId,
				[`[Line: ${event.lineno}, Column: ${event.colno}]`, event.message],
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
			event: CustomEventInit<{ widgetId: string }>,
		) {
			if (!event.detail?.widgetId) return;
			const { widgetId } = event.detail;
			if (widgetMetas[widgetId] && widgetMetas[widgetId].type.includes('bot')) {
				connectBot(widgetId, true);
			}
		}

		addEventListener('widget-core-change', widgetCoreChangeListener);

		return () => {
			removeEventListener('widget-core-change', widgetCoreChangeListener);
		};
	}, [widgetMetas]);

	// hook for other events
	useEffect(() => {
		const directMessageTypes = [
			'twitch-event',
			'widget-values',
			'widget-accounts',
			'widget-button-click',
			'widget-response',
		];

		// directly passing the above events into the bots
		function widgetMessageListener(
			event: CustomEvent<{
				widgetId: string;
				data: Record<string, JSONType>;
			}>,
		) {
			if (!event.detail) return;
			const { widgetId, data } = event.detail;
			const type =
				event.type === 'widget-response'
					? 'slime2:response'
					: `slime2:${event.type}`;
			const newData = { widget_id: widgetId, ...data };

			if (settings.devMode && settings.logWidgetEvents) {
				addBotLog(widgetId, [type, 'message.data.data:', newData], 'info');
			}

			twitchBots.current.get(widgetId)?.postMessage({
				type,
				data: newData,
			});
		}

		directMessageTypes.forEach(type => {
			addEventListener(type, widgetMessageListener as EventListener);
		});

		// disconnect bot if widget is deleted
		function widgetDeleteListener(
			event: CustomEventInit<{ widgetId: string }>,
		) {
			if (!event.detail?.widgetId) return;
			disconnectBot(event.detail.widgetId);
		}

		addEventListener('widget-delete', widgetDeleteListener);

		return () => {
			directMessageTypes.forEach(type => {
				removeEventListener(type, widgetMessageListener as EventListener);
			});

			removeEventListener('widget-delete', widgetDeleteListener);
		};
	}, [settings]);
}

const LogData = z.object({
	data: z.array(z.unknown()),
	level: z.catch(z.literal(['info', 'log', 'error', 'debug', 'warn']), 'log'),
});
