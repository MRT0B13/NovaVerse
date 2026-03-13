import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 15_000, // 15s — serve cached data within this window, prevents duplicate fetches on tab switches / re-mounts
		},
	},
});