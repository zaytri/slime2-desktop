import WidgetSettingsProvider from '@/contexts/widget_settings/WidgetSettingsProvider';
import { createLazyFileRoute } from '@tanstack/react-router';
import Widget from './-components/Widget';

export const Route = createLazyFileRoute('/widget/$widgetId')({
	component: () => {
		const { widgetId } = Route.useParams();
		return (
			<WidgetSettingsProvider id={widgetId}>
				<Widget widgetId={widgetId} />
			</WidgetSettingsProvider>
		);
	},
});
