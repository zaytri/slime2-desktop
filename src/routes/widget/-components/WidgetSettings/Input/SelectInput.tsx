import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import {
	Field,
	Fieldset,
	Label,
	Legend,
	Radio,
	RadioGroup,
} from '@headlessui/react';
import { memo } from 'react';
import { z } from 'zod/v4-mini';
import InputDescription from './InputDescription';

const SelectInput = memo(function SelectInput(
	setting: Props.WithId<WidgetSetting.Input.Select>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);

	// default to the value of the first option
	const value = z
		.catch(
			z.union([z.string(), z.number(), z.boolean()]),
			setting.defaultValue ?? setting.options[0].value,
		)
		.parse(widgetValue);

	const descriptionId = `<[slime2-description]>-${key}`;

	return (
		<Fieldset aria-describedby={descriptionId}>
			<div className='input-wrapper flex-col'>
				<Legend className='input-label'>
					{i18nStringTransform(setting.label)}
				</Legend>

				<RadioGroup
					value={value}
					onChange={setWidgetValue}
					className='font-quicksand flex flex-wrap gap-1.5 py-1'
				>
					{setting.options.map(option => {
						return (
							<Field key={i18nStringTransform(option.label)}>
								<Radio value={option.value} className='input-select-option'>
									<Label className='select-none'>
										{i18nStringTransform(option.label)}
									</Label>
								</Radio>
							</Field>
						);
					})}
				</RadioGroup>
			</div>

			<InputDescription id={descriptionId} value={setting.description} />
		</Fieldset>
	);
});

export default SelectInput;
