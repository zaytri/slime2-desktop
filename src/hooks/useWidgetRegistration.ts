import useAccounts from '@/contexts/accounts/useAccounts';
import useWidgetMetas from '@/contexts/widget_metas/useWidgetMetas';
import { Account } from '@/helpers/json/accounts';
import { loadWidgetSettings } from '@/helpers/json/widgetSettings';
import { loadWidgetValues } from '@/helpers/json/widgetValues';
import bttvApi from '@/helpers/services/emotes/betterTTV';
import ffzApi from '@/helpers/services/emotes/frankerFaceZ';
import twitchApi from '@/helpers/services/twitch/twitchApi';
import { sendWidgetAccounts, sendWidgetValues } from '@/helpers/widgetMessage';
import logZodError from '@/helpers/zodError';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import { z } from 'zod/mini';

export default function useWidgetRegistration() {
	const accounts = useAccounts();
	const widgetMetas = useWidgetMetas();
	const [registeredWidgets, setRegisteredWidgets] = useState<
		Record<string, boolean>
	>({});

	// sends widget values upon webhook registration / bot connection
	useEffect(() => {
		async function registerWidget(widgetId: string) {
			const [settings, values] = await Promise.all([
				loadWidgetSettings(widgetId),
				loadWidgetValues(widgetId),
			]);

			await sendWidgetValues(widgetId, settings, values);

			if (!registeredWidgets[widgetId]) {
				setRegisteredWidgets({
					...registeredWidgets,
					[widgetId]: true,
				});
			}
		}

		// registration from bot
		function botRegistrationListener(event: CustomEvent<{ widgetId: string }>) {
			const { widgetId } = event.detail;
			registerWidget(widgetId);
		}

		addEventListener(
			'bot-registration',
			botRegistrationListener as EventListener,
		);

		// registration from overlay
		const unlistenPromise = listen<WidgetRegistration>(
			'widget-registration',
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
			removeEventListener(
				'bot-registration',
				botRegistrationListener as EventListener,
			);

			unlistenPromise.then(unlisten => {
				if (unlisten) unlisten();
			});
		};
	}, []);

	useEffect(() => {
		async function sendAllAccountData() {
			await Promise.all(
				Object.keys(registeredWidgets).map(async widgetId => {
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

							const [
								cheermotesResponse,
								globalBadgesResponse,
								channelChatBadgesResponse,
								bttvData,
								ffzData,
							] = await Promise.all([
								twitchApi.getCheermotes(account.id, account.serviceId),
								twitchApi.getGlobalBadges(account.id),
								twitchApi.getChannelChatBadges(account.id, account.serviceId),
								bttvApi.getUser('twitch', account.serviceId),
								ffzApi.getRoom('twitch', account.serviceId),
							]);

							return {
								...accountData,
								cheermotes: cheermotesResponse.data.data,
								channelBadges: channelChatBadgesResponse.data.data,
								globalBadges: globalBadgesResponse.data.data,
								betterTTV: bttvData,
								frankerFaceZ: ffzData,
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
