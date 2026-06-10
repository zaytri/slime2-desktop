import { getAppVersion } from '@/helpers/appVersion';
import { useQuery } from '@tanstack/react-query';

export default function useAppVersionQuery() {
	return useQuery({
		queryKey: ['appVersion'],
		queryFn: getAppVersion,
		networkMode: 'always',
	});
}
