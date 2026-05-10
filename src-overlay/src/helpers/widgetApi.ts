import axios from 'axios';
import { BASE_DATA_URL, cacheBust } from './serverUrl';

const widgetApi = axios.create({
	baseURL: BASE_DATA_URL,
});

export async function getHtml(widgetId: string): Promise<string> {
	const html = await widgetApi
		.get<string>(createCorePath(widgetId, cacheBust('index.html')))
		.then(response => response.data);

	return html;
}

export async function getMeta(widgetId: string): Promise<Meta> {
	const config = await widgetApi
		.get<Meta>(createCorePath(widgetId, cacheBust('config/meta.json')))
		.then(response => response.data);

	return config;
}

function createCorePath(id: string, path: string) {
	return `/${id}/core/${path}`;
}

export type Meta = {
	name?: string;
	creator?: string;
	version?: string;
	import?: {
		js?: (string | Record<string, string>)[];
		css?: string[];
	};
	channel?: string[];
};
