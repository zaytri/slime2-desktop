import { useLoaderData } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';
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
	const registeredRef = useRef(false);
	const resolveRejectMapRef = useRef(
		new Map<string, [(value: any) => void, (reason?: any) => void]>(),
	);
	const logEventsRef = useRef(false);

	const { widgetId } = useLoaderData({ from: '/$' });
	globalThis.slime2.widgetId = widgetId;

	useEffect(() => {
		if (registeredRef.current) return;

		const websocket = new WebSocket(WEBSOCKET_BASE_URL);

		// allow widget to make requests to slime2 using the slime2 var
		globalThis.slime2.request = async (
			accountId: string,
			type: string,
			payload: unknown = {},
		) => {
			const requestId = `${type}_${nanoid()}_${Date.now()}`;

			return new Promise((resolve, reject) => {
				resolveRejectMapRef.current.set(requestId, [resolve, reject]);
				websocket.send(
					JSON.stringify({
						type: 'request',
						data: {
							account_id: accountId,
							widget_id: widgetId,
							request_id: requestId,
							request_type: type,
							payload,
						},
					}),
				);
			});
		};

		// send registration message to slime2 upon open connection
		const openListener = () => {
			websocket.send(
				JSON.stringify({
					type: 'register',
					data: {
						id: widgetId,
						channels: [],
					},
				}),
			);

			registeredRef.current = true;
		};

		// listen to websocket messages from slime2 to widget
		const messageListener = async (messageEvent: MessageEvent<any>) => {
			try {
				const { widgetId, type, data } = WebSocketEvent.parse(
					JSON.parse(messageEvent.data),
				);

				if (type === 'widget-response') {
					// resolve the request promise from the widget
					try {
						const { request_id, response } = ResponseEventData.parse(data);

						// find and resolve the related promise
						const resolveReject = resolveRejectMapRef.current.get(request_id);
						if (!resolveReject) return;

						const [resolve, reject] = resolveReject;

						if (response instanceof Object && 'error' in response) {
							reject(response.error);
						} else {
							resolve(response);
						}

						// delete the related resolver
						resolveRejectMapRef.current.delete(request_id);
					} catch (error) {
						logZodError(error);
					}
				} else if (type === 'widget-core-change') {
					location.reload();
				} else if (type === 'log-events') {
					logEventsRef.current = !!data?.logEvents;
				} else {
					const newType = `slime2:${type}`;
					const newData = { widget_id: widgetId, ...data };

					if (logEventsRef.current) {
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
				logZodError(error);
			}
		};

		websocket.addEventListener('open', openListener);
		websocket.addEventListener('message', messageListener);

		return () => {
			websocket.removeEventListener('open', openListener);
			websocket.removeEventListener('message', messageListener);
			websocket.close();
		};
	}, []);
}
