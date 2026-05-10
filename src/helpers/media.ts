import { cacheBust, createPreviewUrl, createTilesUrl } from './serverUrl';

export function getTileIconSrc(id: string, fileName: string) {
	return createTilesUrl(id, cacheBust(`config/${fileName}`));
}

export function getTempFileSrc(fileName: string) {
	return createPreviewUrl(cacheBust(fileName));
}

export function getWidgetIconSrc(id: string) {
	return createTilesUrl(id, cacheBust('core/config/icon.png'));
}

export function getWidgetMediaCoreSrc(id: string, filePath: string) {
	return createTilesUrl(id, cacheBust(`core/${filePath}`));
}

export function getWidgetMediaCustomSrc(id: string, customFileName: string) {
	const [_local, fileName] = customFileName.split(':');
	return createTilesUrl(id, cacheBust(`/config/assets/${fileName}`));
}
