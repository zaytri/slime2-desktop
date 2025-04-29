import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Description, Field, Input, Label } from '@headlessui/react';
import { memo } from 'react';

const NumberInput = memo(function NumberInput(
	setting: WidgetSetting.Input.Number,
) {
	return (
		<Field>
			<div className='rounded-2 flex flex-col border border-stone-300 px-2 py-1'>
				<Label className='text-3 font-medium'>
					{i18nStringTransform(setting.label)}
				</Label>
				<Input
					min={setting.min}
					max={setting.max}
					step={setting.step}
					placeholder={
						setting.placeholder
							? i18nStringTransform(setting.placeholder)
							: undefined
					}
					className='font-quicksand outline-none placeholder:text-stone-400'
				/>
			</div>
			<Description className='text-3.5 font-quicksand px-2 pt-1 text-stone-500'>
				{setting.description
					? i18nStringTransform(setting.description)
					: undefined}
			</Description>
		</Field>
	);
});

export default NumberInput;
