import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Field, Input, Label } from '@headlessui/react';
import { memo } from 'react';
import { z } from 'zod/mini';
import InputDescription from './InputDescription';

const SliderInput = memo(function SliderInput(
	setting: Props.WithId<WidgetSetting.Input.Slider>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);

	// default step to 1, min to 0, max to 100
	const step = setting.step || 1;
	const min = setting.min ?? 0;
	const max = setting.max ?? 100;

	// default to min
	const value = z
		.catch(
			z.number(),
			setting.defaultValue === undefined
				? min
				: Math.max(Math.min(setting.defaultValue, max), min),
		)
		.parse(widgetValue);

	function onChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { value } = event.target;

		const newNumber = value
			? Number.isInteger(step)
				? Number.parseInt(value)
				: Number.parseFloat(value)
			: NaN;

		if (Number.isNaN(newNumber)) {
			setWidgetValue(min);
		} else {
			setWidgetValue(Math.max(Math.min(newNumber, max), min));
		}
	}

	return (
		<Field>
			<div className='input-wrapper flex-col'>
				<Label className='input-label'>
					{i18nStringTransform(setting.label)}
				</Label>

				<div className='flex items-center gap-2'>
					<Input
						autoComplete='off'
						aria-autocomplete='none'
						type='range'
						value={value}
						min={min}
						max={max}
						step={step}
						className='my-1.5 flex-1 cursor-pointer rounded-full outline-offset-3'
						onChange={onChange}
					/>

					<Input
						autoComplete='off'
						aria-autocomplete='none'
						type='number'
						value={value}
						min={min}
						max={max}
						step={step}
						className='input-class w-12 text-right'
						onChange={onChange}
						onWheel={event => {
							// prevents using mouse wheel to increment/decrement number
							// since mouse wheel also scrolls the entire settings container
							event.currentTarget.blur();
						}}
					/>
				</div>
			</div>

			<InputDescription value={setting.description} />
		</Field>
	);
});

export default SliderInput;
