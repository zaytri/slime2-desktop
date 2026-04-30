import SelectedTileProvider from '@/contexts/selected_tile/SelectedTileProvider';
import WidgetIdProvider from '@/contexts/widget_id/WidgetIdProvider';
import useWidgetsPanel from '@/contexts/widgets_panel/useWidgetsPanel';
import { memo } from 'react';
import Folder from './folder/Folder';
import Widget from './widget/Widget';

const WidgetsPanel = memo(function WidgetsPanel() {
	const { widgetId } = useWidgetsPanel();

	if (!widgetId) {
		return (
			<SelectedTileProvider>
				<Folder />
			</SelectedTileProvider>
		);
	}

	return (
		<WidgetIdProvider id={widgetId}>
			<Widget />
		</WidgetIdProvider>
	);
});

export default WidgetsPanel;
