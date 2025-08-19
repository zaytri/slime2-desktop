import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Checkbox, Field, Fieldset, Label, Legend } from '@headlessui/react';
import { memo } from 'react';
import { z } from 'zod/mini';
import InputDescription from './InputDescription';

const MultiSelectInput = memo(function MultiSelectInput(
	setting: Props.WithId<WidgetSetting.Input.MultiSelect>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);

	const values = z
		.catch(
			z.array(z.union([z.string(), z.number(), z.boolean()])),
			setting.defaultValue ?? [],
		)
		.parse(widgetValue);

	const descriptionId = `<[slime2-description]>-${key}`;

	return (
		<Fieldset aria-describedby={descriptionId}>
			<div className='input-wrapper flex-col'>
				<Legend className='input-label'>
					{i18nStringTransform(setting.label)}
				</Legend>

				<div className='font-quicksand flex flex-wrap gap-1.5 py-1'>
					{setting.options.map(option => {
						return (
							<Field key={i18nStringTransform(option.label)}>
								<Checkbox
									className='input-select-option'
									checked={values.includes(option.value)}
									onChange={newCheckedValue => {
										if (newCheckedValue) {
											setWidgetValue([...values, option.value]);
										} else {
											setWidgetValue(
												values.filter(value => {
													return value !== option.value;
												}),
											);
										}
									}}
									onKeyDown={onKeyDown}
								>
									<Label className='cursor-pointer select-none'>
										{i18nStringTransform(option.label)}
									</Label>
								</Checkbox>
							</Field>
						);
					})}
				</div>
			</div>

			<InputDescription id={descriptionId} value={setting.description} />
		</Fieldset>
	);
});

export default MultiSelectInput;

// allows using arrow keys to navigate through the options
// just like the radio group in SelectInput
function onKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
	// only run this on this focused element
	if (document.activeElement !== event.currentTarget) return;

	const parentField = event.currentTarget.parentElement;

	const fieldToFocus =
		event.key === 'ArrowRight' || event.key === 'ArrowDown'
			? // get the next field
				// or the first field if this is the last field
				(parentField?.nextElementSibling ??
				parentField?.parentElement?.firstElementChild)
			: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
				? // get the previous field
					// or the last field if this is the first field
					(parentField?.previousElementSibling ??
					parentField?.parentElement?.lastElementChild)
				: null;

	const checkboxToFocus = fieldToFocus?.firstElementChild;

	if (checkboxToFocus) {
		event.preventDefault();
		(checkboxToFocus as HTMLElement).focus();
	}
}
