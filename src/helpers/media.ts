import serverBaseUrl from './serverBaseUrl';

export function getTileIconUrl(id: string, fileName: string) {
	return `${serverBaseUrl.tiles}/tile/${id}/config/${fileName}`;
}

export function getImagePreviewUrl(fileName: string) {
	return `${serverBaseUrl.preview}/preview/${fileName}`;
}
