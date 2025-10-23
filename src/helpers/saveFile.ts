import { save } from '@tauri-apps/plugin-dialog';

export async function saveZip(): Promise<null | string> {
	return save({
		title: 'Export Widget ZIP',
		filters: [
			{
				name: 'Zip File',
				extensions: ['zip'],
			},
		],
	});
}
