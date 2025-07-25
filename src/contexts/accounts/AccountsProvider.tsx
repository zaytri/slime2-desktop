import {
	Account,
	Accounts,
	deleteTokens,
	loadAccounts,
} from '@/helpers/json/accounts';
import twitchApi, {
	createEventSubParamsList,
} from '@/helpers/services/twitch/twitchApi';
import twitchAuth from '@/helpers/services/twitch/twitchAuth';
import { sendTwitchEvent } from '@/helpers/widgetMessage';
import { memo, useEffect, useReducer, useRef } from 'react';
import { AccountsContext } from './useAccounts';
import {
	AccountsDispatchContext,
	accountsReducer,
} from './useAccountsDispatch';

const AccountsProvider = memo(function AccountsProvider({
	children,
}: Props.WithChildren) {
	const [accounts, dispatch] = useReducer(accountsReducer, {});
	const twitchWebsockets = useRef(new Map<string, WebSocket>());

	function setAccounts(accounts: Accounts) {
		dispatch({ type: 'set', accounts });
	}

	function updateAccount(account: Account) {
		dispatch({ type: 'add', account });
	}

	useEffect(() => {
		async function getAccounts() {
			const accounts = await loadAccounts();
			setAccounts(accounts);
		}

		getAccounts();
	}, []);

	useEffect(() => {
		async function createTwitchWebsocket(
			account: Account,
			reconnectUrl?: string,
		) {
			// get existing eventsub subscriptions
			const response = await twitchApi.getEventSubs(account.id);
			let existingEventSubs = response.data.data;
			let cursor = response.data.pagination.cursor;

			while (cursor) {
				const nextResponse = await twitchApi.getEventSubs(account.id, cursor);

				existingEventSubs = [...existingEventSubs, ...nextResponse.data.data];
				cursor = nextResponse.data.pagination.cursor;
			}

			// delete all existing eventsub subscriptions
			for (const eventSub of existingEventSubs) {
				await twitchApi.deleteEventSub(account.id, eventSub.id).catch(error => {
					console.error(error);
				});
			}

			const websocket = new WebSocket(
				reconnectUrl ?? 'wss://eventsub.wss.twitch.tv/ws',
			);

			let connectionLostTimer: number | null = null;
			let keepAliveTimeoutSeconds: number | null = null;

			// clear out the existing timer
			function clearConnectionLostTimer() {
				if (connectionLostTimer) {
					clearTimeout(connectionLostTimer);
					connectionLostTimer = null;
				}
			}

			// start/restart timer
			function restartConnectionLostTimer() {
				clearConnectionLostTimer();

				if (keepAliveTimeoutSeconds) {
					connectionLostTimer = setTimeout(() => {
						// connection has been lost, create a new connection and disconnect
						createTwitchWebsocket(account);
						websocket.close();

						// 1200 instead of 1000 to allow extra time
					}, keepAliveTimeoutSeconds * 1200);
				}
			}

			// close websocket and set account to need reauthorization
			function reauthorizationNeeded() {
				clearConnectionLostTimer();
				websocket.close();
				updateAccount({
					...account,
					reauthorize: true,
				});
			}

			websocket.addEventListener('message', async message => {
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
							// delete tokens and set account to need reauthorization
							updateAccount({
								...account,
								reauthorize: true,
							});
							deleteTokens(account.id);
							return;
						}

						const { payload } =
							twitchMessage as Twitch.WebsocketMessage.Welcome;
						const sessionId = payload.session.id;

						keepAliveTimeoutSeconds = payload.session.keepalive_timeout_seconds;
						restartConnectionLostTimer();

						// create all eventsub subscriptions using sessionId
						for (const params of createEventSubParamsList(account.serviceId)) {
							// stop creating subscriptions if websocket is closed
							if (websocket.readyState !== WebSocket.OPEN) {
								break;
							}

							await twitchApi
								.createEventSub(account, sessionId, params)
								.catch(error => {
									console.error(params.type, error);
									reauthorizationNeeded();
								});
						}

						break;
					}

					// https://dev.twitch.tv/docs/eventsub/handling-websocket-events/#keepalive-message
					case 'session_keepalive': {
						restartConnectionLostTimer();

						break;
					}

					// https://dev.twitch.tv/docs/eventsub/handling-websocket-events/#notification-message
					case 'notification': {
						restartConnectionLostTimer();
						const notificationMessage =
							twitchMessage as Twitch.WebsocketMessage.Notification;

						// send events to all related widgets
						Promise.all(
							account.widgets.map(async widgetId => {
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
						const { payload } =
							twitchMessage as Twitch.WebsocketMessage.Reconnect;

						clearConnectionLostTimer();

						// create new websocket with reconnect_url
						createTwitchWebsocket(account, payload.session.reconnect_url);
						websocket.close();

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
						if (
							status === 'user_removed' ||
							status === 'authorization_revoked'
						) {
							reauthorizationNeeded();
						}

						break;
					}
				}
			});

			// if a websocket already exists for this account, close it
			const existingWebsocket = twitchWebsockets.current.get(account.id);
			if (existingWebsocket) existingWebsocket.close();

			// save new websocket
			twitchWebsockets.current.set(account.id, websocket);
		}

		Promise.all(
			Object.values(accounts).map(async account => {
				if (account.reauthorize) return;

				if (account.service === 'twitch') {
					try {
						// update user details
						const response = await twitchApi.getUser(
							account.id,
							account.serviceId,
						);
						const user = response.data.data[0];
						if (
							account.username !== user.login ||
							account.displayName !== user.display_name ||
							account.image !== user.profile_image_url
						) {
							updateAccount({
								...account,
								username: user.login,
								displayName: user.display_name,
								image: user.profile_image_url,
							});
						}
					} catch {
						// unable to get user details
						// delete tokens and set account to need reauthorization
						updateAccount({
							...account,
							reauthorize: true,
						});

						try {
							deleteTokens(account.id);
						} catch (error) {
							console.error(error);
						}

						return;
					}

					if (account.type === 'read' && account.widgets.length > 0) {
						createTwitchWebsocket(account);
					}
				}
			}),
		);

		return () => {
			Object.values(twitchWebsockets.current).forEach(websocket => {
				websocket.close();
			});
		};
	}, [accounts]);

	return (
		<AccountsContext value={accounts}>
			<AccountsDispatchContext value={dispatch}>
				{children}
			</AccountsDispatchContext>
		</AccountsContext>
	);
});

export default AccountsProvider;
