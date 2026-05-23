import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/mini';
import Widget from '../components/Widget';
import { getHtml, getMeta } from '../helpers/widgetApi';

const searchSchema = z.object({
	widgetId: z.catch(z.string(), ''),
	dark: z.catch(z.boolean(), false),
});

export const Route = createFileRoute('/$')({
	validateSearch: searchSchema,
	loaderDeps: ({ search }) => {
		return search;
	},
	loader: async ({ deps }) => {
		const { widgetId, dark } = deps;

		// get widget data
		const [html, meta] = await Promise.all([
			getHtml(widgetId),
			getMeta(widgetId),
		]);

		// pass widget HTML to component
		return { html, meta, widgetId, dark };
	},
	component: Widget,
});
