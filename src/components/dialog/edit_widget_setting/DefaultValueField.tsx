import ColorField from '@/components/input_fields/ColorField';
import DropdownField from '@/components/input_fields/DropdownField';
import MultiSelectField from '@/components/input_fields/MultiSelectField';
import MultiTextField from '@/components/input_fields/MultiTextField';
import NumberField from '@/components/input_fields/NumberField';
import SelectField from '@/components/input_fields/SelectField';
import TextField from '@/components/input_fields/TextField';
import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting } from '@@/json/widgetSettings';

type DefaultValueFieldProps = {
	data: DistributivePick<WidgetSetting.AnyInput, 'type' | 'defaultValue'>;
	options?: (
		| WidgetSetting.Input.Dropdown
		| WidgetSetting.Input.Select
		| WidgetSetting.Input.MultiSelect
	)['options'];
	onChange: (value: WidgetSetting.AnyInput['defaultValue']) => void;
};

export default function DefaultValueField({
	data,
	options = [],
	onChange,
}: DefaultValueFieldProps) {
	const label = 'Default Value';

	switch (data.type) {
		case 'text-input':
		case 'text-area-input':
		case 'image-input':
		case 'audio-input':
		case 'video-input':
		case 'font-input':
			return (
				<TextField
					label={label}
					compact
					placeholder='String Value'
					value={data.defaultValue || ''}
					onChange={onChange}
				/>
			);

		case 'color-input':
			return (
				<ColorField
					label={label}
					compact
					placeholder='Color Value'
					value={data.defaultValue || ''}
					onChange={onChange}
				/>
			);

		case 'number-input':
		case 'slider-input':
			return (
				<NumberField
					label={label}
					compact
					placeholder='Number Value'
					value={data.defaultValue === undefined ? null : data.defaultValue}
					onChange={newValue => {
						onChange(newValue === null ? undefined : newValue);
					}}
				/>
			);

		case 'toggle-input':
			return (
				<SelectField
					label={label}
					compact
					value={data.defaultValue || false}
					onChange={onChange}
					options={[
						{ label: 'True', value: true },
						{ label: 'False', value: false },
					]}
				/>
			);

		case 'dropdown-input':
			return (
				<div className='col-span-2'>
					<DropdownField
						label={label}
						compact
						value={data.defaultValue || options[0]?.value}
						onChange={onChange}
						options={options.map(option => {
							return {
								label: i18nStringTransform(option.label),
								value: option.value,
							};
						})}
					/>
				</div>
			);

		case 'select-input':
			return (
				<SelectField
					label={label}
					compact
					value={data.defaultValue || options[0]?.value}
					onChange={onChange}
					options={options.map(option => {
						return {
							label: i18nStringTransform(option.label),
							value: option.value,
						};
					})}
				/>
			);

		case 'multi-text-input':
			return (
				<MultiTextField
					label={label}
					compact
					placeholder='String Value'
					values={data.defaultValue || []}
					onChange={newValues => {
						onChange(newValues.length === 0 ? undefined : newValues);
					}}
				/>
			);

		case 'multi-select-input':
			return (
				<MultiSelectField
					label={label}
					compact
					values={data.defaultValue || []}
					options={options.map(option => {
						return {
							label: i18nStringTransform(option.label),
							value: option.value,
						};
					})}
					onChange={newValues => {
						onChange(newValues.length === 0 ? undefined : newValues);
					}}
				/>
			);

		default:
			return null;
	}
}
