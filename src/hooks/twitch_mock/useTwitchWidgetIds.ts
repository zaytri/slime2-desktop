import useWidgetMetas from '@/contexts/widget_metas/useWidgetMetas';

export default function useTwitchWidgetIds() {
	const widgetMetas = useWidgetMetas();

	// collect ids of every widget that can receive twitch data
	const twitchWidgetIds: string[] = [];
	Object.entries(widgetMetas).forEach(([id, widgetMeta]) => {
		for (const account of widgetMeta.accounts) {
			if (account.service === 'twitch' && account.type === 'read') {
				twitchWidgetIds.push(id);
				break;
			}
		}
	});

	return twitchWidgetIds;
}
