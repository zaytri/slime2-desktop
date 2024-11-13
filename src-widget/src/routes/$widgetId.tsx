import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { baseDataUrl, getConfig, getHtml } from '../services/data';

export const Route = createFileRoute('/$widgetId')({
	loader: async ({ params }) => {
		const { widgetId } = params;

		// get widget data
		const [html, config] = await Promise.all([
			getHtml(widgetId),
			getConfig(widgetId),
		]);

		// set tab title
		document.title = config.title || 'slime2 widget';

		// load widget CSS
		config.css?.forEach(css => {
			const linkElement = document.createElement('link');
			linkElement.setAttribute('rel', 'stylesheet');
			linkElement.setAttribute('href', `${baseDataUrl}/${widgetId}/${css}`);
			linkElement.setAttribute('type', 'text/css');
			document.head.appendChild(linkElement);
		});

		// load widget JS
		config.js?.forEach(js => {
			const scriptElement = document.createElement('script');

			if (typeof js === 'string') {
				scriptElement.src = `${baseDataUrl}/${widgetId}/${js}`;
			} else {
				Object.entries(js).forEach(([attribute, value]) => {
					scriptElement.setAttribute(attribute, value);
				});
			}

			document.head.appendChild(scriptElement);
		});

		// pass widget HTML to component
		return html;
	},
	component: WidgetComponent,
});

// render widget
function WidgetComponent() {
	const html = useLoaderData({ from: '/$widgetId' });

	return (
		<div id='slime2-widget' dangerouslySetInnerHTML={{ __html: html }}></div>
	);
}
