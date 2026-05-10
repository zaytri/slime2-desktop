import { createFileRoute } from '@tanstack/react-router';
import Widget from '../components/Widget';
import { getHtml, getMeta } from '../helpers/widgetApi';

export const Route = createFileRoute('/$')({
	validateSearch: (search: Record<string, unknown>) => {
		return {
			widgetId: (search.widgetId as string) ?? '',
		};
	},
	loaderDeps: ({ search }) => {
		return { widgetId: search.widgetId };
	},
	loader: async ({ deps }) => {
		const { widgetId } = deps;

		// get widget data
		const [html, meta] = await Promise.all([
			getHtml(widgetId),
			getMeta(widgetId),
		]);

		// pass widget HTML to component
		return { html, meta, widgetId };
	},
	component: Widget,
});
