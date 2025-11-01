import { downloadDir } from '@tauri-apps/api/path';
import { save } from '@tauri-apps/plugin-dialog';

export async function saveZip(): Promise<null | string> {
	const downloadDirPath = await downloadDir().catch(error => {
		console.error(error);
		return undefined;
	});

	return save({
		title: 'Export Widget ZIP',
		filters: [
			{
				name: 'Zip File',
				extensions: ['zip'],
			},
		],
		defaultPath: downloadDirPath,
	});
}
