import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';
import NonCategorySetting from './NonCategorySetting';

type NonCategorySettingsProps = {
	settings:
		| WidgetSetting.Category['settings']
		| WidgetSetting.Section['settings']
		| WidgetSetting.MultiSection['settings'];
};

const NonCategorySettings = memo(function NonCategorySettings({
	settings,
}: NonCategorySettingsProps) {
	return (
		<>
			{Object.entries(settings).map(([id, setting]) => {
				const props = { id, ...setting };
				return <NonCategorySetting key={id} {...props} />;
			})}
		</>
	);
});

export default NonCategorySettings;
