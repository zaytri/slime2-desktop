import { appConfigDir, appDataDir } from '@tauri-apps/api/path';

type MainConfigFileName = 'tile_locations';

// fileName must not include ".json" extension
export async function mainConfigPath(fileName: MainConfigFileName) {
	const appConfigDirPath = await appConfigDir();
	return `${appConfigDirPath}/config/${fileName}`;
}

export async function tileFolderPath(id: string) {
	const appDataDirPath = await appDataDir();
	return `${appDataDirPath}/tiles/${id}`;
}
