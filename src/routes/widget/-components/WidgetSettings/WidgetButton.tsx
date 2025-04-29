import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';

const WidgetButton = memo(function WidgetButton(setting: WidgetSetting.Button) {
	return (
		<button
			type='button'
			className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
		>
			{i18nStringTransform(setting.label)}
		</button>
	);
});

export default WidgetButton;
