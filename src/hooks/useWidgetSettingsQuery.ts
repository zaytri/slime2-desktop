import { loadWidgetSettings } from '@/helpers/json/widgetSettings';
import { useQuery } from '@tanstack/react-query';

export function useWidgetSettingsQuery(id: string) {
	return useQuery({
		queryKey: ['widgetSettings', id],
		queryFn: async () => loadWidgetSettings(id),
		networkMode: 'always',
	});
}
