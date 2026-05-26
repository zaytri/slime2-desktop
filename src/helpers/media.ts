import { cacheBust, createPreviewUrl, createTilesUrl } from './serverUrl';

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

export function getWidgetMediaCustomSrc(id: string, customFileName: string) {
	const [_local, fileName] = customFileName.split(':');
	return createTilesUrl(id, `config/assets/${fileName}`);
}

const LOCAL_MEDIA_PREFIX = 'local:';

export function createWidgetMediaLocalValue(fileName: string) {
	return `${LOCAL_MEDIA_PREFIX}${fileName}`;
}

export function getWidgetMediaSrc(widgetId: string, src: string) {
	return src === '' || src.startsWith('https://') || src.startsWith('http://')
		? src
		: src.startsWith(LOCAL_MEDIA_PREFIX)
			? getWidgetMediaCustomSrc(widgetId, src)
			: getWidgetMediaCoreSrc(widgetId, src);
}
