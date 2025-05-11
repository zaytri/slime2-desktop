import { createFileRoute } from '@tanstack/react-router';
import Widget from '../components/Widget';
import { getHtml, getMeta } from '../helpers/widgetApi';

export const Route = createFileRoute('/$widgetId')({
	loader: async ({ params }) => {
		const { widgetId } = params;

		// get widget data
		const [html, meta] = await Promise.all([
			getHtml(widgetId),
			getMeta(widgetId),
		]);

		// pass widget HTML to component
		return { html, meta };
	},
	component: Widget,
});
