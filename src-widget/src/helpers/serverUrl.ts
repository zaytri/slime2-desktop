const DEV_PORT = 57140;
const PROD_PORT = 57143;
const PORT = import.meta.env.PROD ? PROD_PORT : DEV_PORT;

export const WEBSOCKET_URL = `ws://localhost:${PORT}/websocket`;
export const BASE_DATA_URL = `http://localhost:${PORT}/tile`;
