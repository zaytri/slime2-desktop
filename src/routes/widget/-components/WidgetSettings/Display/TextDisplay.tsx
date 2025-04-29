import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';

const TextDisplay = memo(function TextDisplay(
	setting: WidgetSetting.Display.Text,
) {
	return (
		<div id={setting.id} className='rounded-2 bg-amber-100 px-2 py-1'>
			<p>{i18nStringTransform(setting.label)}</p>
		</div>
	);
});

export default TextDisplay;
