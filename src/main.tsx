import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import TileLocationsProvider from './contexts/tile_locations/TileLocationsProvider';
import TileMetasProvider from './contexts/tile_metas/TileMetaProvider';
import { routeTree } from './routeTree.gen';
import './styles.css';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<TileLocationsProvider>
			<TileMetasProvider>
				<RouterProvider router={router} />
			</TileMetasProvider>
		</TileLocationsProvider>
	</React.StrictMode>,
);
