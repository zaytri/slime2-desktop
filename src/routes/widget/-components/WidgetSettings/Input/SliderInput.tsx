import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Description, Field, Input, Label } from '@headlessui/react';
import { memo } from 'react';

const SliderInput = memo(function SliderInput(
	setting: WidgetSetting.Input.Slider,
) {
	return (
		<Field>
			<div className='rounded-2 flex flex-col border border-stone-300 px-2 py-1'>
				<Label className='text-3 font-medium'>
					{i18nStringTransform(setting.label)}
				</Label>
				<div className='flex gap-2 px-1 pt-4'>
					<p className='text-stone-400'>{setting.min ?? 0}</p>
					<Input
						type='range'
						min={setting.min}
						max={setting.max}
						step={setting.step}
						className='font-quicksand flex-1 outline-none placeholder:text-stone-400'
					/>
					<p className='text-stone-400'>{setting.max ?? 100}</p>
				</div>
			</div>
			<Description className='text-3.5 font-quicksand px-2 pt-1 text-stone-500'>
				{setting.description
					? i18nStringTransform(setting.description)
					: undefined}
			</Description>
		</Field>
	);
});

export default SliderInput;
