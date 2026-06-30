import { useLoaderData } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useRef } from 'react';
import { z } from 'zod/mini';
import { WEBSOCKET_BASE_URL } from '../helpers/serverUrl';
import logZodError from '../helpers/zodError';

const WebSocketEvent = z.object({
	widgetId: z.string(),
	type: z.string(),
	data: z.record(z.string(), z.json()),
});

const ResponseEventData = z.object({
	type: z.string(),
	request_id: z.string(),
	response: z.unknown(),
});
type ResponseEventData = z.infer<typeof ResponseEventData>;

export default function useSlime2Websocket() {
	const websocketRef = useRef<WebSocket>(null);
	const requestMapRef = useRef(
		new Map<string, [(value: any) => void, (reason?: any) => void]>(),
	);
	const devLogEventsRef = useRef(false);
	const reconnectTimerRef = useRef<number>(null);
	const connectAttemptRef = useRef(0);

	const { widgetId } = useLoaderData({ from: '/$' });
	globalThis.slime2.widgetId = widgetId;

	const connect = useCallback(() => {
		if (websocketRef.current?.readyState === WebSocket.OPEN) {
			// websocket already open
			return;
		}

		const websocket = new WebSocket(WEBSOCKET_BASE_URL);
		websocketRef.current = websocket;

		async function waitForWebsocketOpen() {
			return new Promise<void>((resolve, reject) => {
				if (websocket.readyState !== websocket.OPEN) {
					websocket.addEventListener(
						'open',
						() => {
							resolve();
						},
						{ once: true },
					);
					websocket.addEventListener(
						'close',
						() => {
							reject('Websocket closed while waiting for request');
						},
						{ once: true },
					);
				} else {
					resolve();
				}
			});
		}

		// allow widget to make requests to slime2 using the slime2 var
		globalThis.slime2.request = async (
			requestType_or_legacyAccountId: string,
			payload_or_legacyRequestType?: string | Record<string, unknown>,
			legacyPayload?: Record<string, unknown>,
		) => {
			const [requestType, payload] =
				typeof payload_or_legacyRequestType === 'string'
					? [
							payload_or_legacyRequestType ?? '',
							{
								account_id: requestType_or_legacyAccountId,
								...(legacyPayload ?? {}),
							},
						]
					: [
							requestType_or_legacyAccountId,
							payload_or_legacyRequestType ?? {},
						];

			const requestId = `${requestType}_${nanoid()}_${Date.now()}`;

			return new Promise(async (resolve, reject) => {
				try {
					await waitForWebsocketOpen();
				} catch {
					resolve(null);
				}
				requestMapRef.current.set(requestId, [resolve, reject]);
				const message = JSON.stringify({
					type: 'request',
					data: {
						widget_id: widgetId,
						request_id: requestId,
						request_type: requestType,
						payload,
					},
				});
				websocket.send(message);
			});
		};

		// send registration message to slime2 upon open connection
		websocket.onopen = () => {
			connectAttemptRef.current = 0;
			console.info('Connected to Slime2!');

			const message = JSON.stringify({
				type: 'register',
				data: {
					id: widgetId,
					channels: [],
				},
			});
			websocket.send(message);
		};

		// listen to websocket messages from slime2 to widget
		websocket.onmessage = async (messageEvent: MessageEvent<any>) => {
			try {
				const { widgetId, type, data } = WebSocketEvent.parse(
					JSON.parse(messageEvent.data),
				);

				if (type === 'widget-response') {
					// resolve the request promise from the widget
					try {
						const { request_id, response } = ResponseEventData.parse(data);

						// find and resolve the related promise
						const resolveReject = requestMapRef.current.get(request_id);
						if (!resolveReject) return;

						const [resolve, reject] = resolveReject;

						if (response instanceof Object && 'error' in response) {
							reject(response.error);
						} else {
							resolve(response);
						}

						// delete the related resolver
						requestMapRef.current.delete(request_id);
					} catch (error) {
						logZodError(error);
					}
				} else if (type === 'widget-core-change') {
					location.reload();
				} else if (type === 'log-events') {
					devLogEventsRef.current = !!data?.logEvents;
				} else {
					const newType = `slime2:${type}`;
					const newData = { widget_id: widgetId, ...data };

					if (devLogEventsRef.current) {
						console.info(
							`%c${newType}`,
							[
								['display', 'block'],
								['padding', '2px 8px'],
								['border-radius', '4px'],
								['background-color', '#d8fa99'],
								['color', '#0d542b'],
								['font-weight', 'bold'],
								['font-size', '14px'],
								['border', '2px solid #0d542b'],
							]
								.map(([property, value]) => `${property}: ${value};`)
								.join(' '),
							'event.detail:',
							newData,
						);
					}

					// for any other type, create events for the widget to listen to
					const customEvent = new CustomEvent(newType, { detail: newData });
					dispatchEvent(customEvent);
				}
			} catch (error) {
				console.error('Websocket Message Error');
				logZodError(error);
			}
		};

		websocket.onerror = () => {
			websocket.close();
		};

		websocket.onclose = () => {
			reconnect();
		};
	}, [widgetId]);

	const reconnect = useCallback(() => {
		if (reconnectTimerRef.current !== null) {
			// websocket already reconnecting
			return;
		}

		// exponential delay, up to 30 seconds
		const baseDelay = Math.min(500 * 2 ** connectAttemptRef.current, 30 * 1000);

		// deviate delay from -500 to 500 milliseconds
		const deviation = Math.random() * 1000 - 500;

		const reconnectDelay = Math.max(0, Math.floor(baseDelay + deviation));

		connectAttemptRef.current += 1;
		console.info(
			'Disconnected from Slime2! Reconnect attempt:',
			connectAttemptRef.current,
			'Reconnecting in',
			reconnectDelay,
			'milliseconds.',
		);

		reconnectTimerRef.current = setTimeout(() => {
			connect();
			reconnectTimerRef.current = null;
		}, reconnectDelay);
	}, [connect]);

	useEffect(() => {
		connect();

		return () => {
			clearTimeout(reconnectTimerRef.current ?? undefined);

			websocketRef.current?.close(3000, 'Component Unmounted');
			globalThis.slime2.request = async () => null;
		};
	}, [connect]);
}
