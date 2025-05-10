import serverBaseUrl from './serverBaseUrl';

export function getTileIconSrc(id: string, fileName: string) {
	const timestamp = Date.now();
	return `${serverBaseUrl.tiles}/tile/${id}/config/${fileName}?timestamp=${timestamp}`;
}

export function getTempFileSrc(fileName: string) {
	const timestamp = Date.now();
	return `${serverBaseUrl.preview}/preview/${fileName}?timestamp=${timestamp}`;
}

export function getWidgetIconSrc(id: string, filePath: string) {
	const timestamp = Date.now();
	return `${serverBaseUrl.tiles}/tile/${id}/core/config/${filePath}?timestamp=${timestamp}`;
}

export function getWidgetMediaCoreSrc(id: string, filePath: string) {
	const timestamp = Date.now();
	return `${serverBaseUrl.tiles}/tile/${id}/core/${filePath}?timestamp=${timestamp}`;
}

export function getWidgetMediaCustomSrc(id: string, customFileName: string) {
	const timestamp = Date.now();
	const [_custom, fileName] = customFileName.split('/');
	return `${serverBaseUrl.tiles}/tile/${id}/config/assets/${fileName}?timestamp=${timestamp}`;
}
