import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting as WidgetSettingType } from '@/helpers/json/widgetSettings';
import { z } from 'zod/mini';
import ColorField from '../input_fields/ColorField';
import DropdownField from '../input_fields/DropdownField';
import FontField from '../input_fields/FontField';
import MediaField from '../input_fields/MediaField';
import MultiMediaField from '../input_fields/MultiMediaField';
import MultiSelectField from '../input_fields/MultiSelectField';
import MultiTextField from '../input_fields/MultiTextField';
import NumberField from '../input_fields/NumberField';
import SelectField from '../input_fields/SelectField';
import SliderField from '../input_fields/SliderField';
import TextAreaField from '../input_fields/TextAreaField';
import TextField from '../input_fields/TextField';
import ToggleField from '../input_fields/ToggleField';
import DisplayImage from './DisplayImage';
import DisplayText from './DisplayText';
import SettingMultiSection from './SettingMultiSection';
import SettingSection from './SettingSection';
import SettingsGroup from './SettingsGroup';
import WidgetButton from './WidgetButton';

type WidgetSettingProps = {
	id: string;
	label: string;
	placeholder?: string;
	description?: string;
	alt: string;
} & WidgetSettingType.NonCategory;

export default function WidgetSetting({
	id,
	label,
	placeholder,
	description,
	alt,
	...setting
}: WidgetSettingProps) {
	const key = useWidgetValueKey(id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);

	const options =
		'options' in setting
			? setting.options.map(option => {
					return {
						label: i18nStringTransform(option.label),
						value: option.value,
					};
				})
			: [];

	switch (setting.type) {
		case 'text-display': {
			return <DisplayText label={label} />;
		}
		case 'image-display': {
			return <DisplayImage label={label} src={setting.src} alt={alt} />;
		}
		case 'text-input': {
			return (
				<TextField
					label={label}
					value={z
						.catch(z.string(), setting.defaultValue ?? '')
						.parse(widgetValue)}
					onChange={setWidgetValue}
					placeholder={placeholder}
					description={description}
				/>
			);
		}
		case 'text-area-input': {
			return (
				<TextAreaField
					label={label}
					value={z
						.catch(z.string(), setting.defaultValue ?? '')
						.parse(widgetValue)}
					onChange={setWidgetValue}
					placeholder={placeholder}
					description={description}
				/>
			);
		}
		case 'multi-text-input': {
			return (
				<MultiTextField
					label={label}
					values={z
						.catch(z.array(z.string()), setting.defaultValue ?? [])
						.parse(widgetValue)}
					onChange={setWidgetValue}
					placeholder={placeholder}
					description={description}
				/>
			);
		}
		case 'number-input': {
			return (
				<NumberField
					label={label}
					value={z
						.catch(z.nullable(z.number()), setting.defaultValue ?? null)
						.parse(widgetValue)}
					onChange={setWidgetValue}
					placeholder={placeholder}
					description={description}
					step={setting.step}
				/>
			);
		}
		case 'slider-input': {
			// default min to 0 and max to 100
			const min = setting.min ?? 0;
			const max = setting.max ?? 100;

			return (
				<SliderField
					label={label}
					value={z
						.catch(
							z.number(),
							setting.defaultValue === undefined
								? min
								: Math.max(Math.min(setting.defaultValue, max), min),
						)
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
					step={setting.step}
					min={min}
					max={max}
				/>
			);
		}
		case 'dropdown-input': {
			return (
				<DropdownField
					label={label}
					value={z
						.catch(
							z.union([z.string(), z.number(), z.boolean()]),
							setting.defaultValue ?? options[0].value,
						)
						.parse(widgetValue)}
					onChange={setWidgetValue}
					options={options}
					placeholder={placeholder}
					description={description}
				/>
			);
		}
		case 'select-input': {
			return (
				<SelectField
					label={label}
					value={z
						.catch(
							z.union([z.string(), z.number(), z.boolean()]),
							setting.defaultValue ?? options[0].value,
						)
						.parse(widgetValue)}
					onChange={setWidgetValue}
					options={options}
					description={description}
				/>
			);
		}
		case 'multi-select-input': {
			return (
				<MultiSelectField
					label={label}
					values={z
						.catch(
							z.array(z.union([z.string(), z.number(), z.boolean()])),
							setting.defaultValue ?? [],
						)
						.parse(widgetValue)}
					onChange={setWidgetValue}
					options={options}
					description={description}
				/>
			);
		}
		case 'toggle-input': {
			return (
				<ToggleField
					label={label}
					value={z
						.catch(z.boolean(), setting.defaultValue ?? false)
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
				/>
			);
		}
		case 'font-input': {
			return (
				<FontField
					label={label}
					value={z
						.catch(z.string(), setting.defaultValue ?? '')
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
					placeholder={placeholder}
				/>
			);
		}
		case 'color-input': {
			return (
				<ColorField
					label={label}
					value={z
						.catch(z.string(), setting.defaultValue ?? '')
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
					placeholder={placeholder}
				/>
			);
		}
		case 'image-input': {
			return (
				<MediaField
					type='image'
					label={label}
					value={z
						.catch(z.string(), setting.defaultValue ?? '')
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
				/>
			);
		}
		case 'video-input': {
			return (
				<MediaField
					type='video'
					label={label}
					value={z
						.catch(z.string(), setting.defaultValue ?? '')
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
				/>
			);
		}
		case 'audio-input': {
			return (
				<MediaField
					type='audio'
					label={label}
					value={z
						.catch(z.string(), setting.defaultValue ?? '')
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
				/>
			);
		}
		case 'multi-image-input': {
			return (
				<MultiMediaField
					type='image'
					label={label}
					values={z
						.catch(z.array(z.string()), setting.defaultValue ?? [])
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
				/>
			);
		}
		case 'multi-audio-input': {
			return (
				<MultiMediaField
					type='audio'
					label={label}
					values={z
						.catch(z.array(z.string()), setting.defaultValue ?? [])
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
				/>
			);
		}
		case 'multi-video-input': {
			return (
				<MultiMediaField
					type='video'
					label={label}
					values={z
						.catch(z.array(z.string()), setting.defaultValue ?? [])
						.parse(widgetValue)}
					onChange={setWidgetValue}
					description={description}
				/>
			);
		}
		case 'button': {
			return <WidgetButton id={key} label={label} />;
		}
		case 'section': {
			return (
				<SettingSection id={key} label={label}>
					<SettingsGroup settings={setting.settings} />
				</SettingSection>
			);
		}
		case 'multi-section': {
			return (
				<SettingMultiSection
					id={key}
					label={label}
					values={z.catch(z.array(z.string()), []).parse(widgetValue)}
					onChange={setWidgetValue}
					settings={setting.settings}
				/>
			);
		}
		default:
			return null;
	}
}
