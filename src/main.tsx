import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import GrabbedTileProvider from './contexts/grabbed_tile/GrabbedTileProvider';
import TileGridProvider from './contexts/tile_grid/TileGridProvider';
import TileMapProvider from './contexts/tile_map/TileMapProvider';
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
		<TileGridProvider>
			<TileMapProvider>
				<GrabbedTileProvider>
					<RouterProvider router={router} />
				</GrabbedTileProvider>
			</TileMapProvider>
		</TileGridProvider>
	</React.StrictMode>,
);
