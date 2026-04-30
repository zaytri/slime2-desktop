import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AccountsProvider from './contexts/accounts/AccountsProvider';
import DialogProvider from './contexts/dialog/DialogProvider';
import FolderIdProvider from './contexts/folder_id/FolderIdProvider';
import SettingsProvider from './contexts/settings/SettingsProvider';
import TileLocationsProvider from './contexts/tile_locations/TileLocationsProvider';
import TileMetasProvider from './contexts/tile_metas/TileMetasProvider';
import TileSwapProvider from './contexts/tile_swap/TileSwapProvider';
import WidgetMetasProvider from './contexts/widget_metas/WidgetMetasProvider';
import MainTabs from './pages/MainTabs';
import './styles.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<SettingsProvider>
				<FolderIdProvider>
					<TileLocationsProvider>
						<TileMetasProvider>
							<WidgetMetasProvider>
								<AccountsProvider>
									<TileSwapProvider>
										<DialogProvider>
											<MainTabs />
										</DialogProvider>
									</TileSwapProvider>
								</AccountsProvider>
							</WidgetMetasProvider>
						</TileMetasProvider>
					</TileLocationsProvider>
				</FolderIdProvider>
			</SettingsProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
