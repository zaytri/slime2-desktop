import useAccounts from '@/contexts/accounts/useAccounts';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { useEventsLogDispatch } from '@/contexts/events_log/useEventsLogDispatch';
import useWidgetMetas from '@/contexts/widget_metas/useWidgetMetas';
import { deleteTokens, type Account } from '@/helpers/json/accounts';
import twitchApi, {
	createEventSubParamsList,
} from '@/helpers/services/twitch/twitchApi';
import twitchAuth from '@/helpers/services/twitch/twitchAuth';
import { sendTwitchEvent } from '@/helpers/widgetMessage';
import { getEventLogId } from '@@/json/eventsLog';
import { useEffect, useRef } from 'react';

const TWITCH_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

export default function useTwitchWebsocket() {
	const widgetMetas = useWidgetMetas();
	const accounts = useAccounts();
	const { addAccount: updateAccount } = useAccountsDispatch();
	const { logEvent } = useEventsLogDispatch();

	const twitchWebsockets = useRef(new Map<string, WebSocket | 'connecting'>());

	// necessary to get the updated account data within functions
	const accountsRef = useRef(accounts);

	useEffect(() => {
		accountsRef.current = accounts;
	}, [accounts]);

	function getAccount(accountId: string): Account | undefined {
		return accountsRef.current[accountId];
	}

	// necesary to get updated widget metas within functions
	const widgetMetasRef = useRef(widgetMetas);

	useEffect(() => {
		widgetMetasRef.current = widgetMetas;
	}, [widgetMetas]);

	function getWidgetMetas() {
		return widgetMetasRef.current;
	}

	async function connectTwitchWebsocket(
		twitchReadAccountId: string,
		reconnectUrl?: string,
	) {
		const account = getAccount(twitchReadAccountId);
		if (!account) return;

		console.info(
			'Account registered to read Twitch events:',
			account.displayName,
		);

		twitchWebsockets.current.set(account.id, 'connecting');

		await removeExistingEventSubs(account.id);

		const websocket = new WebSocket(reconnectUrl ?? TWITCH_WEBSOCKET_URL);
		twitchWebsockets.current.set(account.id, websocket);

		let connectionLostTimer: number | null = null;
		let keepAliveTimeoutSeconds: number | null = null;

		const disconnectTwitchWebsocket = () => {
			const account = getAccount(twitchReadAccountId);
			websocket.close();
			if (account) {
				twitchWebsockets.current.delete(account.id);
			}
		};

		// clear out the existing timer
		const clearConnectionLostTimer = () => {
			if (connectionLostTimer) {
				clearTimeout(connectionLostTimer);
				connectionLostTimer = null;
			}
		};

		// start/restart timer
		const startConnectionLostTimer = () => {
			const account = getAccount(twitchReadAccountId);
			clearConnectionLostTimer();

			if (keepAliveTimeoutSeconds) {
				connectionLostTimer = setTimeout(() => {
					// connection has been lost, disconnect and create a new connection
					console.warn(
						'Account lost connection to Twitch Websocket, reconnecting:',
						account?.displayName,
					);
					disconnectTwitchWebsocket();
					if (account) {
						connectTwitchWebsocket(account.id);
					}

					// 1200 instead of 1000 to allow extra time
				}, keepAliveTimeoutSeconds * 1200);
			}
		};

		// disconnect and set account to need reauthorization
		const reauthorizationNeeded = () => {
			const account = getAccount(twitchReadAccountId);
			console.error(
				'Twitch account requires reauthorization:',
				account?.displayName,
			);
			clearConnectionLostTimer();
			disconnectTwitchWebsocket();
			if (account) {
				updateAccount({ ...account, reauthorize: true });
				deleteTokens(account.id);
			}
		};

		websocket.addEventListener('message', async (message: MessageEvent) => {
			const account = getAccount(twitchReadAccountId);
			if (!account) return;

			const twitchMessage: Twitch.WebsocketMessage.Any = JSON.parse(
				message.data,
			);
			console.debug(
				'[Twitch Websocket]',
				twitchMessage.metadata.message_type,
				'[Account]',
				account.displayName,
			);

			switch (twitchMessage.metadata.message_type) {
				// https://dev.twitch.tv/docs/eventsub/handling-websocket-events/#welcome-message
				case 'session_welcome': {
					try {
						// ensure that the API tokens are ready to use
						// by checking whether or not this throws an error
						await twitchAuth.getValidTokens(account.id);
					} catch (error) {
						console.error(
							'Twitch reauthorization needed for account:',
							account.displayName,
							'Error:',
							error,
						);
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
							console.debug('Websocket closed, stopping EventSub creation.');
							break;
						}

						try {
							console.debug(
								'Creating EventSub:',
								params.type,
								params.version,
								params.condition,
							);
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
					console.debug(
						notificationMessage.metadata.subscription_type,
						notificationMessage.payload.event,
					);

					const relatedWidgets: string[] = [];
					const widgetMetas = getWidgetMetas();
					Object.entries(widgetMetas).forEach(([widgetId, widgetMeta]) => {
						widgetMeta.accounts.forEach((accountSlot, index) => {
							if (
								account.widgets[widgetId] === index ||
								(accountSlot.service === 'twitch' &&
									accountSlot.type === 'read' &&
									account.default)
							) {
								relatedWidgets.push(widgetId);
								console.debug(
									'Sent to Widget:',
									widgetMeta.name,
									widgetMeta.version,
								);

								const { subscription_type, message_timestamp: timestamp } =
									notificationMessage.metadata;
								const { event } = notificationMessage.payload;
								const eventLogId = getEventLogId(account);

								// log specific events to json for event labels
								switch (subscription_type) {
									case 'channel.follow': {
										const followEvent = event as Twitch.WebsocketEvent.Follow;
										logEvent(eventLogId, {
											type: 'follow',
											timestamp,
											data: {
												user_id: followEvent.user_id,
												user_login: followEvent.user_login,
												user_name: followEvent.user_name,
											},
										});
										break;
									}

									case 'channel.subscribe': {
										const subEvent = event as Twitch.WebsocketEvent.Subscribe;

										// don't log individual subs from a gift sub
										if (!subEvent.is_gift) {
											logEvent(eventLogId, {
												type: 'sub',
												timestamp,
												data: {
													user_id: subEvent.user_id,
													user_login: subEvent.user_login,
													user_name: subEvent.user_name,
													tier: subEvent.tier,
												},
											});
										}
										break;
									}

									case 'channel.subscription.message': {
										const resubEvent =
											event as Twitch.WebsocketEvent.SubscriptionMessage;

										logEvent(eventLogId, {
											type: 'resub',
											timestamp,
											data: {
												user_id: resubEvent.user_id,
												user_login: resubEvent.user_login,
												user_name: resubEvent.user_name,
												tier: resubEvent.tier,
												cumulative_months: resubEvent.cumulative_months,
												streak_months: resubEvent.streak_months,
											},
										});
										break;
									}

									case 'channel.subscription.gift': {
										const subGiftEvent =
											event as Twitch.WebsocketEvent.SubscriptionGift;

										logEvent(eventLogId, {
											type: 'sub_gift',
											timestamp,
											data: {
												user_id: subGiftEvent.user_id,
												user_login: subGiftEvent.user_login,
												user_name: subGiftEvent.user_name,
												is_anonymous: subGiftEvent.is_anonymous,
												tier: subGiftEvent.tier,
												total: subGiftEvent.total,
												cumulative_total: subGiftEvent.cumulative_total,
											},
										});
										break;
									}

									case 'channel.raid': {
										const raidEvent = event as Twitch.WebsocketEvent.Raid;
										logEvent(eventLogId, {
											type: 'raid',
											timestamp,
											data: {
												user_id: raidEvent.from_broadcaster_user_id,
												user_login: raidEvent.from_broadcaster_user_login,
												user_name: raidEvent.from_broadcaster_user_name,
												viewers: raidEvent.viewers,
											},
										});

										break;
									}

									case 'channel.cheer': {
										const cheerEvent = event as Twitch.WebsocketEvent.Cheer;
										logEvent(eventLogId, {
											type: 'cheer',
											timestamp,
											data: {
												user_id: cheerEvent.user_id,
												user_login: cheerEvent.user_login,
												user_name: cheerEvent.user_name,
												bits: cheerEvent.bits,
											},
										});

										break;
									}
								}
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

				// only run on twitch read accounts
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

	console.debug('Existing EventSubs found:', eventSubs);
	console.debug('Removing existing EventSubs...');

	for (const eventSub of eventSubs) {
		// need to do this one at a time to prevent rate limiting
		// it's very quick regardless
		await twitchApi.deleteEventSub(accountId, eventSub.id).catch(error => {
			console.error(error);
		});
	}

	console.debug('All existing EventSubs deleted.');
}
