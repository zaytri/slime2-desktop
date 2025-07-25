import useAccounts from '@/contexts/accounts/useAccounts';
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
import { z } from 'zod/v4-mini';

export default function useWidgetRegistration() {
	const accounts = useAccounts();
	const [registeredWidgets, setRegisteredWidgets] = useState<
		Record<string, boolean>
	>({});

	useEffect(() => {
		// sends widget values upon webhook registration
		const unlistenPromise = listen<WidgetRegistration>(
			'widget-registration',
			async event => {
				try {
					// just in case payload isn't formatted correctly
					const { id: widgetId } = WidgetRegistration.parse(event.payload);

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
				} catch (error) {
					logZodError(error);
				}
			},
		);

		return () => {
			unlistenPromise.then(unlisten => {
				if (unlisten) unlisten();
			});
		};
	}, []);

	useEffect(() => {
		async function sendAllAccountData() {
			await Promise.all(
				Object.keys(registeredWidgets).map(async widgetId => {
					const widgetAccounts: Account[] = [];
					Object.values(accounts).forEach(account => {
						if (account.widgets.includes(widgetId)) {
							widgetAccounts.push(account);
						}
					});

					const widgetAccountsData = await Promise.all(
						widgetAccounts.map(async account => {
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
								badges: [
									...channelChatBadgesResponse.data.data,
									...globalBadgesResponse.data.data,
								],
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
	}, [registeredWidgets, accounts]);
}

const WidgetRegistration = z.object({ id: z.string() });
type WidgetRegistration = z.infer<typeof WidgetRegistration>;
