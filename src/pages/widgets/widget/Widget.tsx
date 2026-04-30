import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import WidgetValuesProvider from '@/contexts/widget_values/WidgetValuesProvider';
import { useWidgetSettingsQuery } from '@/hooks/useWidgetSettingsQuery';
import type { WidgetSettings as WidgetSettingsType } from '@@/json/widgetSettings';
import { memo } from 'react';
import WidgetHeader from './WidgetHeader';
import WidgetSettings from './WidgetSettings';

const Widget = memo(function Widget() {
	const widgetId = useWidgetId();
	const widgetSettingsQuery = useWidgetSettingsQuery(widgetId);
	const widgetSettings: WidgetSettingsType = widgetSettingsQuery.data ?? {};
	const { isLoading, isError } = widgetSettingsQuery;

	return (
		<WidgetValuesProvider id={widgetId} settings={widgetSettings}>
			<div className='flex flex-1 p-4'>
				<div className='flex flex-1 flex-col gap-4 dark-container p-4'>
					<WidgetHeader />

					{isLoading ? (
						<p className='font-bold text-white'>Loading Widget Settings...</p>
					) : isError ? (
						<p className='font-bold text-rose-200'>
							Error Loading Widget Settings!
						</p>
					) : (
						<WidgetSettings widgetId={widgetId} settings={widgetSettings} />
					)}
				</div>
			</div>
		</WidgetValuesProvider>
	);
});

export default Widget;
