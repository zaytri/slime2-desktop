import useAccounts from '@/contexts/accounts/useAccounts';
import { useSettings } from '@/contexts/settings/useSettings';
import useWidgetMetas from '@/contexts/widget_metas/useWidgetMetas';
import type { Account } from '@/helpers/json/accounts';
import { loadWidgetSettings } from '@/helpers/json/widgetSettings';
import { loadWidgetValues } from '@/helpers/json/widgetValues';
import {
	sendLogEvents,
	sendWidgetAccounts,
	sendWidgetValues,
} from '@/helpers/widgetMessage';
import logZodError from '@/helpers/zodError';
import { loadTileMeta } from '@@/json/tileMeta';
import { loadWidgetMeta } from '@@/json/widgetMeta';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import { z } from 'zod/mini';

export default function useWidgetRegistration() {
	const { settings } = useSettings();
	const logWidgetEvents = settings.devMode && settings.logWidgetEvents;
	const accounts = useAccounts();
	const widgetMetas = useWidgetMetas();
	const [registeredWidgets, setRegisteredWidgets] = useState(new Set<string>());

	// sends widget values upon webhook registration / bot connection
	useEffect(() => {
		async function registerWidget(widgetId: string) {
			const [settings, values, widgetMeta, tileMeta] = await Promise.all([
				loadWidgetSettings(widgetId),
				loadWidgetValues(widgetId),
				loadWidgetMeta(widgetId),
				loadTileMeta(widgetId),
			]);

			if (logWidgetEvents) {
				sendLogEvents(widgetId, logWidgetEvents);
			}

			console.info(
				`${tileMeta.name}${widgetMeta.name !== tileMeta.name ? ` (${widgetMeta.name})` : ''}: Widget connected.`,
			);

			await sendWidgetValues(widgetId, settings, values);
			setRegisteredWidgets(state => {
				return new Set([...state.values(), widgetId]);
			});
		}

		// registration from bot
		function botRegistrationListener(
			event: CustomEventInit<{ widgetId: string }>,
		) {
			if (!event.detail?.widgetId) return;
			registerWidget(event.detail.widgetId);
		}

		addEventListener('bot-registration', botRegistrationListener);

		// registration from overlay
		const unlistenPromise = listen<WidgetRegistration>(
			'websocket-registration',
			async event => {
				try {
					// just in case payload isn't formatted correctly
					const { id: widgetId } = WidgetRegistration.parse(event.payload);
					registerWidget(widgetId);
				} catch (error) {
					logZodError(error, event.payload);
				}
			},
		);

		return () => {
			removeEventListener('bot-registration', botRegistrationListener);

			unlistenPromise.then(unlisten => {
				if (unlisten) unlisten();
			});
		};
	}, [logWidgetEvents]);

	useEffect(() => {
		registeredWidgets.forEach(widgetId => {
			sendLogEvents(widgetId, logWidgetEvents);
		});
	}, [settings.devMode, logWidgetEvents, registeredWidgets]);

	useEffect(() => {
		async function sendAllAccountData() {
			await Promise.all(
				[...registeredWidgets.values()].map(async widgetId => {
					const meta = widgetMetas[widgetId];
					if (!meta || !meta.accounts || meta.accounts.length === 0) {
						return;
					}

					const slottedAccounts = meta.accounts.map((accountSlot, index) => {
						let slottedAccount: Account | null = null;

						for (const account of Object.values(accounts)) {
							if (account.reauthorize) {
								continue;
							}

							if (
								account.service === accountSlot.service &&
								account.type === accountSlot.type &&
								account.default
							) {
								slottedAccount = account;
							}

							if (account.widgets[widgetId] === index) {
								slottedAccount = account;
								break;
							}
						}

						return slottedAccount;
					});

					const widgetAccountsData = await Promise.all(
						slottedAccounts.map(async account => {
							if (!account) return null;

							const accountData = {
								id: account.id,
								type: account.type,
								service: account.service,
								serviceId: account.serviceId,
								username: account.username,
								displayName: account.displayName,
							};

							if (account.type !== 'read' || account.service !== 'twitch') {
								return accountData;
							}

							return {
								...accountData,
								//* disable eventsLog for now
								// eventsLog: eventsLog[getEventLogId(account)] || [],
							};
						}),
					);

					if (widgetAccountsData.length > 0) {
						await sendWidgetAccounts(widgetId, widgetAccountsData);
					}
				}),
			);
		}

		sendAllAccountData();
	}, [registeredWidgets, accounts, widgetMetas]);
}

const WidgetRegistration = z.object({ id: z.string() });
type WidgetRegistration = z.infer<typeof WidgetRegistration>;
