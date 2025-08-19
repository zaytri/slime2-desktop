import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Field, Input, Label } from '@headlessui/react';
import { memo } from 'react';
import { z } from 'zod/mini';
import InputDescription from './InputDescription';

const NumberInput = memo(function NumberInput(
	setting: Props.WithId<WidgetSetting.Input.Number>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);

	const value = z
		.catch(z.nullable(z.number()), setting.defaultValue ?? null)
		.parse(widgetValue);

	// default step to 1
	const step = setting.step || 1;

	return (
		<Field>
			<div className='input-wrapper flex-col'>
				<Label className='input-label'>
					{i18nStringTransform(setting.label)}
				</Label>

				<Input
					value={value === null ? '' : value}
					type='number'
					autoComplete='off'
					aria-autocomplete='none'
					min={setting.min}
					max={setting.max}
					step={step}
					placeholder={
						setting.placeholder
							? i18nStringTransform(setting.placeholder)
							: undefined
					}
					className='input-class'
					onChange={event => {
						const { value } = event.target;

						let newNumber = value
							? Number.isInteger(step)
								? Number.parseInt(value)
								: Number.parseFloat(value)
							: NaN;

						if (Number.isNaN(newNumber)) {
							setWidgetValue(null);
						} else {
							if (setting.max !== undefined) {
								newNumber = Math.min(newNumber, setting.max);
							}
							if (setting.min !== undefined) {
								newNumber = Math.max(newNumber, setting.min);
							}
							setWidgetValue(newNumber);
						}
					}}
					onWheel={event => {
						// prevents using mouse wheel to increment/decrement number
						// since mouse wheel also scrolls the entire settings container
						event.currentTarget.blur();
					}}
				/>
			</div>

			<InputDescription value={setting.description} />
		</Field>
	);
});

export default NumberInput;
