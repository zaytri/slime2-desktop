import { useQuery } from '@tanstack/react-query';
import { loadSystemFonts } from './commands';
import { loadWidgetSettings } from './json/widgetSettings';

export function useWidgetSettings(id: string) {
	return useQuery({
		queryKey: ['widgetSettings', id],
		queryFn: async () => loadWidgetSettings(id),
		networkMode: 'always',
	});
}

export function useSystemFonts() {
	return useQuery({
		queryKey: ['systemFonts'],
		queryFn: async () =>
			loadSystemFonts().then(fonts =>
				[...fonts].sort((a, b) =>
					a.toLocaleUpperCase().localeCompare(b.toLocaleUpperCase()),
				),
			),
		initialData: [],
		networkMode: 'always',
	});
}
