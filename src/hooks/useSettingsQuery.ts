import { loadSettings, type Settings } from '@/helpers/json/settings';
import { useQuery } from '@tanstack/react-query';

export function useSettingsQuery() {
	return useQuery<Settings>({
		queryKey: ['settings'],
		queryFn: loadSettings,
		networkMode: 'always',
	});
}
