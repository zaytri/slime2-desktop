import { sendWidgetCoreChange } from '@/helpers/widgetMessage';
import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

export default function useWidgetCoreChange() {
	useEffect(() => {
		const unlistenPromise = listen<string>('widget-core-watch', event => {
			sendWidgetCoreChange(event.payload);
		});

		return () => {
			unlistenPromise.then(unlisten => {
				if (unlisten) unlisten();
			});
		};
	}, []);
}
