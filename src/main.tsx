import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AccountsProvider from './contexts/accounts/AccountsProvider';
import DialogProvider from './contexts/dialog/DialogProvider';
import EventsLogProvider from './contexts/events_log/EventsLogProvider';
import FolderIdProvider from './contexts/folder_id/FolderIdProvider';
import SettingsProvider from './contexts/settings/SettingsProvider';
import TileLocationsProvider from './contexts/tile_locations/TileLocationsProvider';
import TileMetasProvider from './contexts/tile_metas/TileMetasProvider';
import TileSwapProvider from './contexts/tile_swap/TileSwapProvider';
import WidgetMetasProvider from './contexts/widget_metas/WidgetMetasProvider';
import { queryClient } from './helpers/queryClient';
import MainTabs from './pages/MainTabs';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<SettingsProvider>
				<FolderIdProvider>
					<TileLocationsProvider>
						<TileMetasProvider>
							<WidgetMetasProvider>
								<AccountsProvider>
									<EventsLogProvider>
										<TileSwapProvider>
											<DialogProvider>
												<MainTabs />
											</DialogProvider>
										</TileSwapProvider>
									</EventsLogProvider>
								</AccountsProvider>
							</WidgetMetasProvider>
						</TileMetasProvider>
					</TileLocationsProvider>
				</FolderIdProvider>
			</SettingsProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
