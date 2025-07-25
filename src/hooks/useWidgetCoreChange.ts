import { sendWidgetCoreChange } from '@/helpers/widgetMessage';
import { appDataDir } from '@tauri-apps/api/path';
import { BaseDirectory, watch } from '@tauri-apps/plugin-fs';
import { useEffect } from 'react';

export default function useWidgetCoreChange() {
	useEffect(() => {
		const unwatchPromise = watch(
			'tiles',
			async event => {
				const baseDirectory = await appDataDir();

				event.paths.forEach(path => {
					const pathComponents = path
						.replace(`${baseDirectory}\\`, '')
						.split('\\');
					const [tilesDirName, widgetId, innerDirName] = pathComponents;
					if (
						tilesDirName === 'tiles' &&
						widgetId.startsWith('widget') &&
						innerDirName === 'core'
					) {
						sendWidgetCoreChange(widgetId);
					}
				});
			},
			{
				baseDir: BaseDirectory.AppData,
				delayMs: 1000,
				recursive: true,
			},
		);

		return () => {
			unwatchPromise.then(unwatch => {
				if (unwatch) unwatch();
			});
		};
	}, []);
}
