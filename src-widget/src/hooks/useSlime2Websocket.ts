import { useLoaderData } from '@tanstack/react-router';
import { useCallback, useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import { WEBSOCKET_URL } from '../helpers/serverUrl';

export default function useSlime2Websocket() {
	const { widgetId } = useLoaderData({ from: '/$' });
	const registeredRef = useRef(false);
	const { sendJsonMessage } = useWebSocket(WEBSOCKET_URL, {
		onMessage: event => {
			console.log(JSON.parse(event.data));
		},
	});

	const sendCommand = useCallback(
		(command: Command) => {
			sendJsonMessage(command);
		},
		[sendJsonMessage],
	);

	useEffect(() => {
		if (registeredRef.current) return;

		sendCommand({
			type: 'register',
			data: {
				id: widgetId,
				channels: [],
			},
		});

		registeredRef.current = true;
	}, []);
}

type Command = { type: 'register'; data: RegisterData };

type RegisterData = {
	id: string;
	channels: string[];
};
