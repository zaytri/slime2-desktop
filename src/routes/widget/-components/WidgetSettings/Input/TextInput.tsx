import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { Field, Input, Label, Textarea } from '@headlessui/react';
import { memo } from 'react';
import { z } from 'zod';
import InputDescription from './InputDescription';

const TextInput = memo(function TextInput(
	setting: Props.WithId<
		WidgetSetting.Input.Text | WidgetSetting.Input.TextArea
	>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);

	const value = z
		.string()
		.catch(setting.defaultValue ?? '')
		.parse(widgetValue);

	const placeholder = setting.placeholder
		? i18nStringTransform(setting.placeholder)
		: undefined;

	function onChange(
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) {
		setWidgetValue(event.target.value);
	}

	return (
		<Field>
			<div className='input-wrapper flex-col'>
				<Label className='input-label'>
					{i18nStringTransform(setting.label)}
				</Label>

				{setting.type === 'text-area-input' ? (
					<Textarea
						value={value}
						onChange={onChange}
						placeholder={placeholder}
						className='input-class'
						autoComplete='off'
						aria-autocomplete='none'
						rows={4}
					/>
				) : (
					<Input
						value={value}
						onChange={onChange}
						placeholder={placeholder}
						className='input-class'
						autoComplete='off'
						aria-autocomplete='none'
					/>
				)}
			</div>

			<InputDescription value={setting.description} />
		</Field>
	);
});

export default TextInput;
