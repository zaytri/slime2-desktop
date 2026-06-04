import { sendWidgetCoreChange } from '@/helpers/widgetMessage';
import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';

export default function useWidgetCoreChange() {
	useEffect(() => {
		const unlistenPromise = listen<string>('widget-core-watch', event => {
			console.debug(
				'Widget core change received for widget ID:',
				event.payload,
			);
			sendWidgetCoreChange(event.payload);
		});

		return () => {
			unlistenPromise.then(unlisten => {
				if (unlisten) unlisten();
			});
		};
	}, []);
}
