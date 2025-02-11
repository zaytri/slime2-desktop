//? Tauri Command Guide: https://tauri.app/v1/guides/features/command
import { invoke } from '@tauri-apps/api/core';

export async function sendWebsocketMessage(
	message: string,
	channel: string,
): Promise<void> {
	return invoke('send_websocket_message', { message, channel });
}

export async function installWidget(zipPath: string): Promise<string> {
	return invoke('install_widget', { zipPath });
}

export async function installDefaultWidget(
	widgetName: string,
): Promise<string> {
	return invoke('install_default_widget', { widgetName });
}

export async function copyWidget(widgetId: string): Promise<string> {
	return invoke('copy_widget', { widgetId });
}

export async function deleteWidget(widgetId: string): Promise<void> {
	return invoke('delete_widget', { widgetId });
}

export async function extractWidgetDetails(zipPath: string): Promise<string> {
	return invoke('extract_widget_details', { zipPath });
}

// filePath must not include ".json" extension
export async function loadJson(filePath: string): Promise<unknown> {
	const jsonString: string = await invoke('load_json', { filePath });
	return JSON.parse(jsonString);
}

// filePath must not include ".json" extension
// pretty prints the string before saving
export async function saveJson(
	jsonObject: unknown,
	filePath: string,
): Promise<void> {
	const jsonString = JSON.stringify(jsonObject, null, 2);
	return invoke('save_json', { jsonString, filePath });
}

export async function createWidgetFolder(): Promise<string> {
	return invoke('create_widget_folder');
}

export async function deleteWidgetFolder(folderId: string): Promise<void> {
	return invoke('delete_widget_folder', { folderId });
}

export async function tempCopy(filePath: string): Promise<string> {
	return invoke('temp_copy', { filePath });
}

export async function saveTempFolderIcon(
	fileName: string,
	folderId: string,
): Promise<void> {
	return invoke('save_temp_folder_icon', { fileName, folderId });
}
