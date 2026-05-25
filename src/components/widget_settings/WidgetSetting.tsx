import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import useWidgetValueKey, {
	getWidgetValueChildKey,
} from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { useWidgetValuesDispatch } from '@/contexts/widget_values/useWidgetValuesDispatch';
import { saveTempWidgetFile } from '@/helpers/commands';
import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting as WidgetSettingType } from '@/helpers/json/widgetSettings';
import {
	createWidgetMediaLocalValue,
	getWidgetMediaSrc,
} from '@/helpers/media';
import type { WidgetValue } from '@@/json/widgetValues';
import { z } from 'zod/mini';
import DevPeek from '../DevPeek';
import ColorField from '../input_fields/ColorField';
import DropdownField from '../input_fields/DropdownField';
import FontField from '../input_fields/FontField';
import MediaField from '../input_fields/MediaField';
import MultiSelectField from '../input_fields/MultiSelectField';
import MultiTextField from '../input_fields/MultiTextField';
import NumberField from '../input_fields/NumberField';
import SelectField from '../input_fields/SelectField';
import SliderField from '../input_fields/SliderField';
import TextAreaField from '../input_fields/TextAreaField';
import TextField from '../input_fields/TextField';
import ToggleField from '../input_fields/ToggleField';
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
	const widgetId = useWidgetId();
	const key = useWidgetValueKey(id);
	const { setValue } = useWidgetValuesDispatch();
	const { widgetValue, getSubValue } = useWidgetValue(key);

	const options =
		'options' in setting
			? setting.options.map(option => {
					return {
						label: i18nStringTransform(option.label),
						value: option.value,
					};
				})
			: [];

	function setWidgetValue(value: WidgetValue) {
		setValue(key, value);
	}

	// Any subvalues added here also need to be handled in mergeDefaultValues

	// default volume to 20, ensure it's between 0 and 100
	const volume = z
		.catch(z.number().check(z.gte(0), z.lte(100)), 20)
		.parse(getSubValue('volume'));

	function setSubValue(subKey: string, value: WidgetValue) {
		setValue(getWidgetValueChildKey(key, subKey), value);
	}

	async function onChangeMedia(newValue: string) {
		if (
			newValue === '' ||
			newValue.startsWith('https://') ||
			newValue.startsWith('http://')
		) {
			setWidgetValue(newValue);
		} else {
			const fileName = await saveTempWidgetFile(newValue, widgetId);
			setWidgetValue(createWidgetMediaLocalValue(fileName));
		}
	}

	function onChangeVolume(newVolume: number) {
		setSubValue('volume', newVolume);
	}

	switch (setting.type) {
		case 'text-display': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<DisplayText label={label} />
				</NonGroupWrapper>
			);
		}
		// case 'image-display': {
		// 	return <DisplayImage label={label} src={setting.src} alt={alt} />;
		// }
		case 'text-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<TextField
						label={label}
						value={z
							.catch(z.string(), setting.defaultValue ?? '')
							.parse(widgetValue)}
						onChange={setWidgetValue}
						placeholder={placeholder}
						description={description}
					/>
				</NonGroupWrapper>
			);
		}
		case 'text-area-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<TextAreaField
						label={label}
						value={z
							.catch(z.string(), setting.defaultValue ?? '')
							.parse(widgetValue)}
						onChange={setWidgetValue}
						placeholder={placeholder}
						description={description}
					/>
				</NonGroupWrapper>
			);
		}
		case 'multi-text-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<MultiTextField
						label={label}
						values={z
							.catch(z.array(z.string()), setting.defaultValue ?? [])
							.parse(widgetValue)}
						onChange={setWidgetValue}
						placeholder={placeholder}
						description={description}
					/>
				</NonGroupWrapper>
			);
		}
		case 'number-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<NumberField
						label={label}
						value={z
							.catch(z.nullable(z.number()), setting.defaultValue ?? null)
							.parse(widgetValue)}
						onChange={setWidgetValue}
						placeholder={placeholder}
						description={description}
						step={setting.step}
						min={setting.min}
						max={setting.max}
					/>
				</NonGroupWrapper>
			);
		}
		case 'slider-input': {
			// default min to 0 and max to 100
			const min = setting.min ?? 0;
			const max = setting.max ?? 100;

			return (
				<NonGroupWrapper id={id} setting={setting}>
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
				</NonGroupWrapper>
			);
		}
		case 'dropdown-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<DropdownField
						label={label}
						value={z
							.catch(
								z.union([z.string(), z.number(), z.boolean()]),
								setting.defaultValue ?? options[0]?.value ?? '',
							)
							.parse(widgetValue)}
						onChange={setWidgetValue}
						options={options}
						placeholder={placeholder}
						description={description}
					/>
				</NonGroupWrapper>
			);
		}
		case 'select-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<SelectField
						label={label}
						value={z
							.catch(
								z.union([z.string(), z.number(), z.boolean()]),
								setting.defaultValue ?? options[0]?.value ?? '',
							)
							.parse(widgetValue)}
						onChange={setWidgetValue}
						options={options}
						description={description}
					/>
				</NonGroupWrapper>
			);
		}
		case 'multi-select-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
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
				</NonGroupWrapper>
			);
		}
		case 'toggle-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<ToggleField
						label={label}
						value={z
							.catch(z.boolean(), setting.defaultValue ?? false)
							.parse(widgetValue)}
						onChange={setWidgetValue}
						description={description}
					/>
				</NonGroupWrapper>
			);
		}
		case 'font-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<FontField
						label={label}
						value={z
							.catch(z.string(), setting.defaultValue ?? '')
							.parse(widgetValue)}
						onChange={setWidgetValue}
						description={description}
						placeholder={placeholder}
					/>
				</NonGroupWrapper>
			);
		}
		case 'color-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<ColorField
						label={label}
						value={z
							.catch(z.string(), setting.defaultValue ?? '')
							.parse(widgetValue)}
						onChange={setWidgetValue}
						description={description}
						placeholder={placeholder}
					/>
				</NonGroupWrapper>
			);
		}
		case 'image-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<MediaField
						type='image'
						label={label}
						value={getMediaValue(widgetId, widgetValue, setting.defaultValue)}
						onChange={onChangeMedia}
						description={description}
					/>
				</NonGroupWrapper>
			);
		}
		case 'video-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<MediaField
						type='video'
						label={label}
						value={getMediaValue(widgetId, widgetValue, setting.defaultValue)}
						onChange={onChangeMedia}
						description={description}
						volume={volume}
						onChangeVolume={onChangeVolume}
					/>
				</NonGroupWrapper>
			);
		}
		case 'audio-input': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<MediaField
						type='audio'
						label={label}
						value={getMediaValue(widgetId, widgetValue, setting.defaultValue)}
						onChange={onChangeMedia}
						description={description}
						volume={volume}
						onChangeVolume={onChangeVolume}
					/>
				</NonGroupWrapper>
			);
		}
		case 'button': {
			return (
				<NonGroupWrapper id={id} setting={setting}>
					<WidgetButton id={key} label={label} />
				</NonGroupWrapper>
			);
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

function getMediaValue(
	widgetId: string,
	value: WidgetValue,
	defaultValue?: string,
) {
	const src = z.catch(z.string(), defaultValue ?? '').parse(value);
	return getWidgetMediaSrc(widgetId, src);
}

type NonGroupWrapperProps = {
	id: string;
	setting: DistributiveOmit<WidgetSettingType.NonGroup, 'label'>;
};

function NonGroupWrapper({
	id,
	setting,
	children,
}: Props.WithChildren<NonGroupWrapperProps>) {
	return (
		<div className='relative'>
			<DevPeek id={id} setting={setting} />
			{children}
		</div>
	);
}
