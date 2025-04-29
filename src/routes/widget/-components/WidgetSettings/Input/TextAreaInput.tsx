import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Description, Field, Label, Textarea } from '@headlessui/react';
import { memo } from 'react';

const TextAreaInput = memo(function TextAreaInput(
	setting: WidgetSetting.Input.TextArea,
) {
	return (
		<Field>
			<div className='rounded-2 flex flex-col border border-stone-300 px-2 py-1'>
				<Label className='text-3 font-medium'>
					{i18nStringTransform(setting.label)}
				</Label>
				<Textarea
					placeholder={
						setting.placeholder
							? i18nStringTransform(setting.placeholder)
							: undefined
					}
					rows={4}
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

export default TextAreaInput;
