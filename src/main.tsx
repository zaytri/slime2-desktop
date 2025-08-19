import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AccountsProvider from './contexts/accounts/AccountsProvider';
import TileLocationsProvider from './contexts/tile_locations/TileLocationsProvider';
import TileMetasProvider from './contexts/tile_metas/TileMetasProvider';
import WidgetMetasProvider from './contexts/widget_metas/WidgetMetasProvider';
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
			<TileLocationsProvider>
				<TileMetasProvider>
					<WidgetMetasProvider>
						<AccountsProvider>
							<RouterProvider router={router} />
						</AccountsProvider>
					</WidgetMetasProvider>
				</TileMetasProvider>
			</TileLocationsProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
