import { loadSystemFonts } from '@/helpers/commands';
import { useQuery } from '@tanstack/react-query';

export function useSystemFontsQuery() {
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
