import { QueryClientProvider } from '@tanstack/react-query';
import {
	attachConsole,
	debug,
	error,
	info,
	trace,
	warn,
} from '@tauri-apps/plugin-log';
import React from 'react';
import ReactDOM from 'react-dom/client';
import AccountsProvider from './contexts/accounts/AccountsProvider';
import BotLogsProvider from './contexts/bot_logs/BotLogsProvider';
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

attachConsole();
const FROM_LOGGER_PREFIX = ':SLIME2RUSTLOGGER:';

// Override console messages to additionally send to logger plugin
function forwardConsole(
	fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
	logger: (message: string) => Promise<void>,
) {
	const original = console[fnName];
	console[fnName] = (...data: any[]) => {
		const [firstData, ...rest] = data;
		if (
			typeof firstData === 'string' &&
			firstData.startsWith(FROM_LOGGER_PREFIX)
		) {
			if (firstData.includes('[web:console]')) return;
			original(firstData.substring(FROM_LOGGER_PREFIX.length), ...rest);
		} else {
			original(...data);
			logger(
				data
					.map(item => {
						return typeof item === 'string' ? item : JSON.stringify(item);
					})
					.join(' '),
			);
		}
	};
}

forwardConsole('log', trace);
forwardConsole('debug', debug);
forwardConsole('info', info);
forwardConsole('warn', warn);
forwardConsole('error', error);

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
											<BotLogsProvider>
												<DialogProvider>
													<MainTabs />
												</DialogProvider>
											</BotLogsProvider>
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
