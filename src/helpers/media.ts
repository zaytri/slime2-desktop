import serverBaseUrl from './serverBaseUrl';

export function getTileIconUrl(id: string, fileName: string) {
	const timestamp = Date.now();
	return `${serverBaseUrl.tiles}/tile/${id}/config/${fileName}?timestamp=${timestamp}`;
}

export function getImagePreviewUrl(fileName: string) {
	const timestamp = Date.now();
	return `${serverBaseUrl.preview}/preview/${fileName}?timestamp=${timestamp}`;
}

export function getImageDisplayUrl(id: string, filePath: string) {
	const timestamp = Date.now();
	return `${serverBaseUrl.tiles}/tile/${id}/core/${filePath}?timestamp=${timestamp}`;
}
