import { getVersion } from '@tauri-apps/api/app';

const appVersionPromise = getVersion();

export async function getAppVersion() {
	return appVersionPromise;
}
