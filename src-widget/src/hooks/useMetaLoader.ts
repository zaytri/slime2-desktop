import { useLoaderData } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { BASE_DATA_URL } from '../helpers/serverUrl';
import { Meta } from '../helpers/widgetApi';

export default function useMetaLoader() {
	const { meta, widgetId } = useLoaderData({ from: '/$' });
	const loadingRef = useRef(true);

	useEffect(() => {
		if (!loadingRef.current) return;

		setTitle(meta);
		loadCSS(meta, widgetId);
		loadJS(meta, widgetId);

		loadingRef.current = false;
	}, [meta, widgetId]);
}

// set tab title
function setTitle(meta: Meta) {
	let title = meta.name || 'slime2 widget';
	if (meta.version) title = `${title} v${meta.version}`;
	if (meta.creator) title = `${title} by ${meta.creator}`;

	document.title = title;
}

function loadCSS(meta: Meta, widgetId: string) {
	meta.import?.css?.forEach(css => {
		console.log(css);
		const linkElement = document.createElement('link');
		linkElement.setAttribute('rel', 'stylesheet');
		linkElement.setAttribute('href', generateImportURL(css, widgetId));
		linkElement.setAttribute('type', 'text/css');
		document.head.appendChild(linkElement);
	});
}

function loadJS(meta: Meta, widgetId: string) {
	meta.import?.js?.forEach(js => {
		const scriptElement = document.createElement('script');

		if (typeof js === 'string') {
			scriptElement.src = generateImportURL(js, widgetId);
		} else {
			Object.entries(js).forEach(([attribute, value]) => {
				if (attribute === 'src') {
					scriptElement.src = generateImportURL(value, widgetId);
				} else {
					scriptElement.setAttribute(attribute, value);
				}
			});
		}

		document.head.appendChild(scriptElement);
	});
}

function generateImportURL(fileName: string, widgetId: string) {
	const url =
		fileName.startsWith('http://') || fileName.startsWith('https://')
			? fileName
			: `${BASE_DATA_URL}/${widgetId}/core/${fileName}`;

	// cache busting
	return `${url}?timestamp=${Date.now()}`;
}
