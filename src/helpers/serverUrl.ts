export const DEV_PORT = 57140;
export const DEV_OVERLAY_SERVER_PORT = 57141;
export const PROD_PORT = 57143;

export const PORT = import.meta.env.PROD ? PROD_PORT : DEV_PORT;
export const DEFAULT_BASE_URL = `http://localhost:${PORT}`;

export const TILES_BASE_URL = `${DEFAULT_BASE_URL}/tile`;
export const PREVIEW_BASE_URL = `${DEFAULT_BASE_URL}/preview`;
export const MEDIA_BASE_URL = `${DEFAULT_BASE_URL}/media`;
export const WEBSOCKET_BASE_URL = `ws://localhost:${PORT}/websocket`;
export const OVERLAY_SERVER_BASE_URL = `http://localhost:${import.meta.env.PROD ? `${PROD_PORT}/overlay` : DEV_OVERLAY_SERVER_PORT}`;

export function createTilesUrl(id: string, path: string) {
	return `${TILES_BASE_URL}/${id}/${path}`;
}

export function createPreviewUrl(fileName: string) {
	return `${PREVIEW_BASE_URL}/${fileName}`;
}

export function createOverlayUrl(id: string) {
	return `${OVERLAY_SERVER_BASE_URL}/?widgetId=${id}`;
}

export function createMediaUrl(fileName: string) {
	return `${MEDIA_BASE_URL}/${fileName}`;
}

export function cacheBust(path: string) {
	return `${path}?timestamp=${Date.now()}`;
}
