import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';

const WidgetButton = memo(function WidgetButton(
	setting: Props.WithId<WidgetSetting.Button>,
) {
	return (
		<button
			type='button'
			className='rounded-2 over:translate-y-0.5 over:from-stone-300 over:to-stone-200 over:shadow-none text-5 w-full border border-white bg-stone-400 bg-linear-to-b from-stone-200 to-stone-300 py-1 font-medium text-stone-700 shadow-[0_3px_0_1px] shadow-stone-400 outline-2 outline-stone-400 focus-visible:outline-offset-0! focus-visible:outline-black active:outline-3 active:outline-black'
		>
			{i18nStringTransform(setting.label)}
		</button>
	);
});

export default WidgetButton;
