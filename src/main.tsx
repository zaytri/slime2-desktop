import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AccountsProvider from './contexts/accounts/AccountsProvider';
import TileLocationsProvider from './contexts/tile_locations/TileLocationsProvider';
import TileMetasProvider from './contexts/tile_metas/TileMetaProvider';
import { routeTree } from './routeTree.gen';
import './styles.css';

// Create a react router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

// Create a react query client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AccountsProvider>
				<TileLocationsProvider>
					<TileMetasProvider>
						<RouterProvider router={router} />
					</TileMetasProvider>
				</TileLocationsProvider>
			</AccountsProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
