import { getPronouns } from '@/helpers/services/pronouns';
import { sendWidgetResponse } from '@/helpers/widgetMessage';
import logZodError from '@/helpers/zodError';
import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import { z } from 'zod/mini';

export default function useWidgetRequest() {
	useEffect(() => {
		const unlistenPromise = listen<z.infer<typeof WidgetRequest>>(
			'widget-request',
			async event => {
				try {
					const request = WidgetRequest.parse(event.payload);
					switch (request.request_type) {
						case 'get-pronouns': {
							const { platform, user_id, username } = request.payload;
							const pronouns = await getPronouns(platform, user_id, username);
							sendWidgetResponse(
								request.widget_id,
								request.request_type,
								request.request_id,
								pronouns,
							);
							break;
						}
						default:
							throw Error('Unhandled request type!');
					}
				} catch (error) {
					const formattedError = logZodError(error, event.payload);

					const type = event.payload?.request_type;
					const widgetId = event.payload?.widget_id;
					const requestId = event.payload?.request_id;

					if (type && widgetId && requestId) {
						sendWidgetResponse(widgetId, type, requestId, {
							error: formattedError,
						});
					}
				}
			},
		);

		return () => {
			unlistenPromise.then(unlisten => {
				if (unlisten) unlisten();
			});
		};
	}, []);
}

const PronounsRequest = z.object({
	request_type: z.literal('get-pronouns'),
	payload: z.object({
		platform: z.literal('twitch'),
		user_id: z.string(),
		username: z.string(),
	}),
});

const WidgetRequest = z.intersection(
	z.object({
		request_id: z.string(),
		widget_id: z.string(),
	}),
	z.discriminatedUnion('request_type', [PronounsRequest]),
);
