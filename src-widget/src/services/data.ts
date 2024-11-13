import axios from 'axios';

export const baseDataUrl = `http://localhost:${import.meta.env.DEV ? 57140 : 57143}/tile`;

const widgetApi = axios.create({
	baseURL: baseDataUrl,
});

export async function getHtml(widget: string): Promise<string> {
	const html = await widgetApi
		.get<string>(`/${widget}`)
		.then(response => response.data);

	return html;
}

type Config = {
	js?: (string | Record<string, string>)[];
	css?: string[];
	title?: string;
	author?: string;
};

export async function getConfig(widget: string): Promise<Config> {
	const config = await widgetApi
		.get<Config>(`/${widget}/config.json`)
		.then(response => response.data);

	return config;
}
