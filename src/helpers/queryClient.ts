import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export async function refetchQuery(queryKey: string[]) {
	return queryClient.refetchQueries({ queryKey, exact: true });
}
