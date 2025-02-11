const DEV_PORT = 57140;
const DEV_WIDGET_SERVER_PORT = 57141;
const PROD_PORT = 57143;

function createBaseUrl(prodPort: number, devPort: number) {
	return `http://localhost:${import.meta.env.PROD ? prodPort : devPort}`;
}

const DEFAULT_BASE_URL = createBaseUrl(PROD_PORT, DEV_PORT);

const serverBaseUrl = {
	widgetServer: createBaseUrl(PROD_PORT, DEV_WIDGET_SERVER_PORT),
	tiles: DEFAULT_BASE_URL,
	preview: DEFAULT_BASE_URL,
	webSocket: DEFAULT_BASE_URL,
};

export default serverBaseUrl;
