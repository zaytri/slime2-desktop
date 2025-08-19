import { useLoaderData } from '@tanstack/react-router';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';
import { z } from 'zod/mini';
import { WEBSOCKET_URL } from '../helpers/serverUrl';
import logZodError from '../helpers/zodError';

const WebSocketEvent = z.object({
	type: z.string(),
	data: z.unknown(),
});

const RequestType = z.union([z.literal('get-pronouns')]);
type RequestType = z.infer<typeof RequestType>;

const ResponseEventData = z.object({
	type: RequestType,
	request_id: z.string(),
	response: z.unknown(),
});
type ResponseEventData = z.infer<typeof ResponseEventData>;

export default function useSlime2Websocket() {
	const { widgetId } = useLoaderData({ from: '/$' });
	const registeredRef = useRef(false);
	const resolveRejectMapRef = useRef(
		new Map<string, [(value: any) => void, (reason?: any) => void]>(),
	);

	useEffect(() => {
		if (registeredRef.current) return;

		const websocket = new WebSocket(WEBSOCKET_URL);

		// requests sent from widget to slime2
		const sendRequest = async <Payload, Response>(
			type: RequestType,
			payload: Payload,
		): Promise<Response> => {
			const requestId = `${type}_${nanoid()}_${Date.now()}`;

			return new Promise<Response>((resolve, reject) => {
				resolveRejectMapRef.current.set(requestId, [resolve, reject]);
				websocket.send(
					JSON.stringify({
						type: 'request',
						data: {
							widget_id: widgetId,
							request_id: requestId,
							request_type: type,
							payload,
						},
					}),
				);
			});
		};

		// allow widget to make requests using the slime2 var
		globalThis.slime2.getPronouns = (platform, userId, username) => {
			return sendRequest('get-pronouns', {
				platform,
				user_id: userId,
				username,
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
				const { type, data } = WebSocketEvent.parse(
					JSON.parse(messageEvent.data),
				);

				if (type === 'widget-response') {
					// resolve the request promise from the widget
					try {
						const { type, request_id, response } =
							ResponseEventData.parse(data);

						// ensure request type is expected
						try {
							RequestType.parse(type);
						} catch (error) {
							console.error('Invalid request type!');
							logZodError(error);
							return;
						}

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
				} else {
					// for any other type, create events for the widget to listen to
					const customEvent = new CustomEvent(`slime2:${type}`, {
						detail: data,
					});
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
