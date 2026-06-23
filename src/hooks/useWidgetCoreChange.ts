import { sendWidgetCoreChange } from '@/helpers/widgetMessage';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useEffect, useRef } from 'react';

export default function useWidgetCoreChange() {
	const lastCoreChangeTimesRef = useRef(new Map<string, number>());

	useEffect(() => {
		const unlistenPromise = getCurrentWebviewWindow().listen<string>(
			'widget-core-watch',
			event => {
				const widgetId = event.payload;
				const timeNow = Date.now();
				const timeSinceLastCoreChange =
					timeNow - (lastCoreChangeTimesRef.current.get(widgetId) ?? 0);

				// send at most once every 5 seconds per widget
				if (timeSinceLastCoreChange > 5000) {
					lastCoreChangeTimesRef.current.set(widgetId, timeNow);
					console.debug('Sending widget core change for widget ID:', widgetId);
					sendWidgetCoreChange(widgetId);
				}
			},
		);

		return () => {
			unlistenPromise.then(unlisten => {
				if (unlisten) unlisten();
			});
		};
	}, []);
}
