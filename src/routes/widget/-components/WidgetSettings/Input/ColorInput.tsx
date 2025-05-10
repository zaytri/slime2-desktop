import ColorInputPreview from '@/components/ColorInputPreview';
import { useDialog } from '@/contexts/dialog/useDialog';
import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Field, Label } from '@headlessui/react';
import clsx from 'clsx';
import { memo } from 'react';
import { z } from 'zod';
import InputDescription from './InputDescription';

const ColorInput = memo(function ColorInput(
	setting: Props.WithId<WidgetSetting.Input.Color>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);
	const { open } = useDialog();

	const value = z
		.string()
		.catch(setting.defaultValue ?? '')
		.parse(widgetValue);

	const placeholder = setting.placeholder
		? i18nStringTransform(setting.placeholder)
		: 'Select font...';

	return (
		<Field>
			<button
				type='button'
				className='input-wrapper group items-center gap-2'
				onClick={() => {
					open({
						name: 'SelectColor',
						payload: {
							value,
							onSave: setWidgetValue,
						},
					});
				}}
			>
				<div className='flex flex-1 flex-col'>
					<Label className='input-label'>
						{i18nStringTransform(setting.label)}
					</Label>

					<p className={clsx('font-quicksand', !value && 'text-stone-400')}>
						{value || placeholder}
					</p>
				</div>

				<ColorInputPreview
					color={value}
					className='group-focus-visible:outline-2 group-focus-visible:outline-offset-1 group-focus-visible:outline-black'
				/>
			</button>

			<InputDescription value={setting.description} />
		</Field>
	);
});

export default ColorInput;
