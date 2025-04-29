import { createLazyFileRoute } from '@tanstack/react-router';
import Widget from './-components/Widget';

export const Route = createLazyFileRoute('/widget/$widgetId')({
	component: Widget,
});
