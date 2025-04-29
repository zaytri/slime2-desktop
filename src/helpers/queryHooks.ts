import { useQuery } from '@tanstack/react-query';
import { loadWidgetMeta } from './json/widgetMeta';
import { loadWidgetSettings } from './json/widgetSettings';

export function useWidgetMeta(id: string) {
	return useQuery({
		queryKey: ['widgetMeta', id],
		queryFn: async () => loadWidgetMeta(id),
		networkMode: 'always',
	});
}

export function useWidgetSettings(id: string) {
	return useQuery({
		queryKey: ['widgetSettings', id],
		queryFn: async () => loadWidgetSettings(id),
		networkMode: 'always',
	});
}
