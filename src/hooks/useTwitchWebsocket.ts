import useAccounts from '@/contexts/accounts/useAccounts';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import useWidgetMetas from '@/contexts/widget_metas/useWidgetMetas';
import { Account, deleteTokens } from '@/helpers/json/accounts';
import twitchApi, {
	createEventSubParamsList,
} from '@/helpers/services/twitch/twitchApi';
import twitchAuth from '@/helpers/services/twitch/twitchAuth';
import { sendTwitchEvent } from '@/helpers/widgetMessage';
import { useEffect, useRef } from 'react';

const TWITCH_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

export default function useTwitchWebsocket() {
	const widgetMetas = useWidgetMetas();
	const accounts = useAccounts();
	const { addAccount: updateAccount } = useAccountsDispatch();

	const twitchWebsockets = useRef(new Map<string, WebSocket | 'connecting'>());

	// necessary to get the updated account data within functions
	const accountsRef = useRef(accounts);

	useEffect(() => {
		accountsRef.current = accounts;
	}, [accounts]);

	function getAccount(accountId: string): Account | undefined {
		return accountsRef.current[accountId];
	}

	async function connectTwitchWebsocket(
		twitchReadAccountId: string,
		reconnectUrl?: string,
	) {
		const account = getAccount(twitchReadAccountId);
		if (!account) return;

		twitchWebsockets.current.set(account.id, 'connecting');

		await removeExistingEventSubs(account.id);

		const websocket = new WebSocket(reconnectUrl ?? TWITCH_WEBSOCKET_URL);
		twitchWebsockets.current.set(account.id, websocket);

		let connectionLostTimer: number | null = null;
		let keepAliveTimeoutSeconds: number | null = null;

		function disconnectTwitchWebsocket() {
			const account = getAccount(twitchReadAccountId);
			if (!account) return;

			websocket.close();
			twitchWebsockets.current.delete(account.id);
		}

		// clear out the existing timer
		function clearConnectionLostTimer() {
			if (connectionLostTimer) {
				clearTimeout(connectionLostTimer);
				connectionLostTimer = null;
			}
		}

		// start/restart timer
		function startConnectionLostTimer() {
			const account = getAccount(twitchReadAccountId);
			if (!account) return;

			clearConnectionLostTimer();

			if (keepAliveTimeoutSeconds) {
				connectionLostTimer = setTimeout(() => {
					// connection has been lost, disconnect and create a new connection
					disconnectTwitchWebsocket();
					connectTwitchWebsocket(account.id);

					// 1200 instead of 1000 to allow extra time
				}, keepAliveTimeoutSeconds * 1200);
			}
		}

		// disconnect and set account to need reauthorization
		function reauthorizationNeeded() {
			const account = getAccount(twitchReadAccountId);
			if (!account) return;

			clearConnectionLostTimer();
			disconnectTwitchWebsocket();
			updateAccount({
				...account,
				reauthorize: true,
			});
			deleteTokens(account.id);
		}

		websocket.addEventListener('message', async message => {
			const account = getAccount(twitchReadAccountId);
			if (!account) return;

			const twitchMessage: Twitch.WebsocketMessage.Any = JSON.parse(
				message.data,
			);

			switch (twitchMessage.metadata.message_type) {
				// https://dev.twitch.tv/docs/eventsub/handling-websocket-events/#welcome-message
				case 'session_welcome': {
					try {
						// ensure that the API tokens are ready to use
						// by checking whether or not this throws an error
						await twitchAuth.getValidTokens(account.id);
					} catch {
						// unable to get valid tokens
						// set account to need reauthorization
						reauthorizationNeeded();
						return;
					}

					const { payload } = twitchMessage as Twitch.WebsocketMessage.Welcome;
					const sessionId = payload.session.id;

					keepAliveTimeoutSeconds = payload.session.keepalive_timeout_seconds;
					startConnectionLostTimer();

					// create all eventsub subscriptions using sessionId
					for (const params of createEventSubParamsList(account.serviceId)) {
						// stop creating subscriptions if websocket is closed
						if (websocket.readyState !== WebSocket.OPEN) {
							break;
						}

						try {
							await twitchApi.createEventSub(account, sessionId, params);
						} catch (error) {
							console.error(params.type, error);
							reauthorizationNeeded();
							break;
						}
					}

					break;
				}

				// https://dev.twitch.tv/docs/eventsub/handling-websocket-events/#keepalive-message
				case 'session_keepalive': {
					startConnectionLostTimer();

					break;
				}

				// https://dev.twitch.tv/docs/eventsub/handling-websocket-events/#notification-message
				case 'notification': {
					startConnectionLostTimer();
					const notificationMessage =
						twitchMessage as Twitch.WebsocketMessage.Notification;

					const relatedWidgets: string[] = [];
					Object.entries(widgetMetas).forEach(([widgetId, widgetMeta]) => {
						widgetMeta.accounts.forEach((accountSlot, index) => {
							if (
								account.widgets[widgetId] === index ||
								(accountSlot.service === 'twitch' &&
									accountSlot.type === 'read' &&
									account.default)
							) {
								relatedWidgets.push(widgetId);
							}
						});
					});
					// send events to all related widgets
					Promise.all(
						relatedWidgets.map(async widgetId => {
							await sendTwitchEvent(
								account.id,
								widgetId,
								notificationMessage.metadata.message_id,
								notificationMessage.metadata.subscription_type,
								notificationMessage.metadata.subscription_version,
								notificationMessage.metadata.message_timestamp,
								notificationMessage.payload.event,
							);
						}),
					);

					break;
				}

				// https://dev.twitch.tv/docs/eventsub/handling-websocket-events/#reconnect-message
				case 'session_reconnect': {
					clearConnectionLostTimer();
					disconnectTwitchWebsocket();

					const { payload } =
						twitchMessage as Twitch.WebsocketMessage.Reconnect;

					// create new websocket with reconnect_url
					connectTwitchWebsocket(account.id, payload.session.reconnect_url);

					break;
				}

				// https://dev.twitch.tv/docs/eventsub/handling-websocket-events/#revocation-message
				case 'revocation': {
					const {
						metadata,
						payload: {
							subscription: { status },
						},
					} = twitchMessage as Twitch.WebsocketMessage.Revocation;

					console.error(
						`Subscription "${metadata.subscription_type}" has been revoked due to "${status}".`,
						{
							type: metadata.subscription_type,
							version: metadata.subscription_version,
							status: status,
							username: account.username,
							userId: account.serviceId,
						},
					);

					// no longer authorized by user or user has been banned
					if (status === 'user_removed' || status === 'authorization_revoked') {
						reauthorizationNeeded();
					}

					break;
				}
			}
		});
	}

	useEffect(() => {
		// don't run if there are no widgets or no accounts
		if (
			Object.keys(widgetMetas).length === 0 ||
			Object.keys(accounts).length === 0
		) {
			return;
		}

		Promise.all(
			Object.values(accounts).map(async account => {
				if (account.reauthorize) return;

				if (
					account.service === 'twitch' &&
					account.type === 'read' &&
					!twitchWebsockets.current.has(account.id)
				) {
					connectTwitchWebsocket(account.id);
				}
			}),
		);
	}, [widgetMetas, accounts]);
}

async function removeExistingEventSubs(accountId: string) {
	const initialResponse = await twitchApi.getEventSubs(accountId);
	let eventSubs = initialResponse.data.data;
	let cursor = initialResponse.data.pagination.cursor;

	while (cursor) {
		const nextResponse = await twitchApi.getEventSubs(accountId, cursor);
		eventSubs = [...eventSubs, ...nextResponse.data.data];
		cursor = nextResponse.data.pagination.cursor;
	}

	for (const eventSub of eventSubs) {
		// need to do this one at a time to prevent rate limiting
		// it's very quick regardless
		await twitchApi.deleteEventSub(accountId, eventSub.id).catch(error => {
			console.error(error);
		});
	}
}
