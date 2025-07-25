import axios from 'axios';
import { BASE_DATA_URL } from './serverUrl';

const widgetApi = axios.create({
	baseURL: BASE_DATA_URL,
});

export async function getHtml(widgetId: string): Promise<string> {
	const html = await widgetApi
		.get<string>(`/${widgetId}/core/index.html?timestamp=${Date.now()}`)
		.then(response => response.data);

	return html;
}

export async function getMeta(widgetId: string): Promise<Meta> {
	const config = await widgetApi
		.get<Meta>(`/${widgetId}/core/config/meta.json?timestamp=${Date.now()}`)
		.then(response => response.data);

	return config;
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
