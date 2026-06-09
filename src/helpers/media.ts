import { appDataDir, resolve } from '@tauri-apps/api/path';
import {
	cacheBust,
	createMediaUrl,
	createPreviewUrl,
	createTilesUrl,
} from './serverUrl';

export function getTileIconSrc(id: string, fileName: string) {
	return createTilesUrl(id, `config/${fileName}`);
}

export function getTempFileSrc(fileName: string) {
	return createPreviewUrl(cacheBust(fileName));
}

export function getWidgetIconSrc(id: string) {
	return createTilesUrl(id, cacheBust('core/config/icon.png'));
}

export function getWidgetMediaCoreSrc(id: string, filePath: string) {
	return createTilesUrl(id, `core/${filePath}`);
}

export function getWidgetMediaGallerySrc(customFileName: string) {
	const [_gallery, fileName] = customFileName.split(':');
	return createMediaUrl(fileName ?? '');
}

export const LEGACY_LOCAL_MEDIA_PREFIX = 'local:';
export const MEDIA_GALLERY_PREFIX = 'gallery:';

export function createWidgetMediaGalleryValue(fileName: string) {
	return `${MEDIA_GALLERY_PREFIX}${fileName}`;
}

export function getWidgetMediaSrc(widgetId: string, src: string) {
	return src === '' || src.startsWith('https://') || src.startsWith('http://')
		? src
		: src.startsWith(MEDIA_GALLERY_PREFIX)
			? getWidgetMediaGallerySrc(src)
			: getWidgetMediaCoreSrc(widgetId, src);
}

export async function mediaFolderPath() {
	const appDataDirPath = await appDataDir();
	return resolve(appDataDirPath, 'media');
}
