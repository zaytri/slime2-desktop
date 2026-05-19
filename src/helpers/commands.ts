//? Tauri Command Guide: https://tauri.app/v1/guides/features/command
import { invoke } from '@tauri-apps/api/core';
import type { DefaultWidgetId } from './defaultWidgets';

export async function sendWebsocketMessage(
	message: string,
	channel: string,
): Promise<void> {
	return invoke('send_websocket_message', { message, channel });
}

export async function installCustomWidget(zipPath: string): Promise<string> {
	return invoke('install_custom_widget', { zipPath });
}

export async function packageCustomWidget(
	widgetId: string,
	zipPath: string,
): Promise<string> {
	return invoke('package_custom_widget', { widgetId, zipPath });
}

export async function installDefaultWidget(
	widgetName: DefaultWidgetId,
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
// never call this directly, use queueSaveJson
export async function saveJson(
	jsonObject: unknown,
	filePath: string,
): Promise<void> {
	const jsonString = JSON.stringify(jsonObject, null, '\t');
	return invoke('save_json', { jsonString, filePath });
}

export async function createWidgetFolder(
	folderName?: string,
	color?: string,
): Promise<string> {
	return invoke('create_widget_folder', {
		folderName: folderName ?? 'New Folder',
		color: color ?? 'green',
	});
}

export async function deleteWidgetFolder(folderId: string): Promise<void> {
	return invoke('delete_widget_folder', { folderId });
}

export async function tempCopy(filePath: string): Promise<string> {
	return invoke('temp_copy', { filePath });
}

export async function saveTempTileIcon(
	fileName: string,
	tileId: string,
): Promise<string> {
	return invoke('save_temp_tile_icon', { fileName, tileId });
}

export async function saveTempWidgetFile(
	fileName: string,
	widgetId: string,
): Promise<string> {
	return invoke('save_temp_widget_file', { fileName, widgetId });
}

export async function saveTempWidgetCoreIcon(
	fileName: string,
	widgetId: string,
): Promise<string> {
	return invoke('save_temp_widget_core_icon', { fileName, widgetId });
}

export async function getSecretKey(key: string): Promise<string> {
	return invoke('get_secret_key', { key });
}

export async function setSecretKey(key: string, value: string): Promise<void> {
	return invoke('set_secret_key', { key, value });
}

export async function deleteSecretKey(key: string): Promise<void> {
	return invoke('delete_secret_key', { key });
}

type FontData = {
	postscript_name: string;
	full_name: string;
	family_name: string;
	is_monospace: boolean;
	properties: {
		style: string; // 'Normal' | 'Italic' | 'Oblique'
		weight: number; // between 100 - 900
		stretch: number; // between 0.5 - 2.0
	};
};

export async function loadSystemFonts(): Promise<FontData[]> {
	return invoke('load_system_fonts');
}

export async function revealLogFile(): Promise<void> {
	return invoke('reveal_log_file');
}
