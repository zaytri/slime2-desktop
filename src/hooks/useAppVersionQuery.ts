import { useQuery } from '@tanstack/react-query';
import { getVersion } from '@tauri-apps/api/app';

export default function useAppVersionQuery() {
	return useQuery({
		queryKey: ['appVersion'],
		queryFn: getVersion,
		networkMode: 'always',
	});
}
