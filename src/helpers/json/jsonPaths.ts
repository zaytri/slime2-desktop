import { appConfigDir, appDataDir } from '@tauri-apps/api/path';

// fileName must not include ".json" extension
export async function mainConfigPath(fileName: string) {
	const appConfigDirPath = await appConfigDir();
	return `${appConfigDirPath}/config/${fileName}`;
}

export async function tileFolderPath(id: string) {
	const appDataDirPath = await appDataDir();
	return `${appDataDirPath}/tiles/${id}`;
}
