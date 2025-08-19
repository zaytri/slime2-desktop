import { z } from 'zod/mini';
import { loadJson } from '../commands';
import { I18nString } from '../i18n';
import logZodError from '../zodError';
import { tileFolderPath } from './jsonPaths';

// functions

export async function loadWidgetSettings(id: string): Promise<WidgetSettings> {
	try {
		const json = await loadJson(await settingsPath(id));
		const data = WidgetSettings.parse(json);
		return data;
	} catch (error) {
		logZodError(error);
		throw error;
	}
}

async function settingsPath(id: string) {
	const folderPath = await tileFolderPath(id);
	return `${folderPath}/core/config/settings`;
}

// zod and types

const Placeholder = z.optional(I18nString);
const Description = z.optional(I18nString);

const MediaDefaultValue = z.optional(z.string());
const MultiMediaDefaultValue = z.optional(z.array(z.string()));

const OptionValue = z.union([z.string(), z.number(), z.boolean()]);
export type OptionValue = z.infer<typeof OptionValue>;

const Options = z.array(
	z.object({
		label: I18nString,
		value: OptionValue,
	}),
);

const BaseSetting = z.object({
	label: I18nString,
	condition: z.optional(z.record(z.string(), OptionValue)),
	searchTags: z.optional(z.array(z.string())),
});

const ButtonSetting = z.object({
	type: z.literal('button'),
});

const TextDisplaySetting = z.object({
	type: z.literal('text-display'),
});

const ImageDisplaySetting = z.object({
	type: z.literal('image-display'),
	src: z.string(),
	alt: I18nString,
});

const TextInputSetting = z.object({
	type: z.literal('text-input'),
	defaultValue: z.optional(z.string()),
	placeholder: Placeholder,
	description: Description,
});

const TextAreaInputSetting = z.object({
	type: z.literal('text-area-input'),
	defaultValue: z.optional(z.string()),
	placeholder: Placeholder,
	description: Description,
});

const MultiTextInputSetting = z.object({
	type: z.literal('multi-text-input'),
	defaultValue: z.optional(z.array(z.string())),
	placeholder: Placeholder,
	description: Description,
});

const NumberInputSetting = z.object({
	type: z.literal('number-input'),
	defaultValue: z.optional(z.number()),
	min: z.optional(z.number()),
	max: z.optional(z.number()),
	step: z.optional(z.union([z.number(), z.literal('any')])),
	placeholder: Placeholder,
	description: Description,
});

const SliderInputSetting = z.object({
	type: z.literal('slider-input'),
	defaultValue: z.optional(z.number()),
	min: z.optional(z.number()),
	max: z.optional(z.number()),
	step: z.optional(z.union([z.number(), z.literal('any')])),
	description: Description,
});

const ToggleInputSetting = z.object({
	type: z.literal('toggle-input'),
	defaultValue: z.optional(z.boolean()),
	description: Description,
});

const DropdownInputSetting = z.object({
	type: z.literal('dropdown-input'),
	defaultValue: z.optional(OptionValue),
	placeholder: Placeholder,
	description: Description,
	options: Options,
});

const SelectInputSetting = z.object({
	type: z.literal('select-input'),
	defaultValue: z.optional(OptionValue),
	description: Description,
	options: Options,
});

const MultiSelectInputSetting = z.object({
	type: z.literal('multi-select-input'),
	defaultValue: z.optional(z.array(OptionValue)),
	description: Description,
	options: Options,
});

const ImageInputSetting = z.object({
	type: z.literal('image-input'),
	description: Description,
	defaultValue: MediaDefaultValue,
});

const MultiImageInputSetting = z.object({
	type: z.literal('multi-image-input'),
	description: Description,
	defaultValue: MultiMediaDefaultValue,
});

const VideoInputSetting = z.object({
	type: z.literal('video-input'),
	description: Description,
	defaultValue: MediaDefaultValue,
});

const MultiVideoInputSetting = z.object({
	type: z.literal('multi-video-input'),
	description: Description,
	defaultValue: MultiMediaDefaultValue,
});

const AudioInputSetting = z.object({
	type: z.literal('audio-input'),
	description: Description,
	defaultValue: MediaDefaultValue,
});

const MultiAudioInputSetting = z.object({
	type: z.literal('multi-audio-input'),
	description: Description,
	defaultValue: MultiMediaDefaultValue,
});

const ColorInputSetting = z.object({
	type: z.literal('color-input'),
	defaultValue: z.optional(z.string()),
	description: Description,
	placeholder: Placeholder,
});

const FontInputSetting = z.object({
	type: z.literal('font-input'),
	defaultValue: z.optional(z.string()),
	description: Description,
	placeholder: Placeholder,
});

const BaseSectionSetting = z.discriminatedUnion('type', [
	ButtonSetting,
	TextDisplaySetting,
	ImageDisplaySetting,
	TextInputSetting,
	TextAreaInputSetting,
	MultiTextInputSetting,
	NumberInputSetting,
	SliderInputSetting,
	ToggleInputSetting,
	DropdownInputSetting,
	SelectInputSetting,
	MultiSelectInputSetting,
	ImageInputSetting,
	MultiImageInputSetting,
	VideoInputSetting,
	MultiVideoInputSetting,
	AudioInputSetting,
	MultiAudioInputSetting,
	ColorInputSetting,
	FontInputSetting,
]);

const SectionSetting = z.object({
	type: z.literal('section'),
	settings: z.record(
		z.string(),
		z.intersection(BaseSectionSetting, BaseSetting),
	),
});

const MultiSectionSetting = z.object({
	type: z.literal('multi-section'),
	settings: z.record(
		z.string(),
		z.intersection(BaseSetting, BaseSectionSetting),
	),
});

const BaseCategorySetting = z.discriminatedUnion('type', [
	...BaseSectionSetting.def.options,
	SectionSetting,
	MultiSectionSetting,
]);

const NonCategorySetting = z.intersection(BaseSetting, BaseCategorySetting);
type NonCategorySetting = z.infer<typeof NonCategorySetting>;

const CategorySetting = z.object({
	label: I18nString,
	settings: z.record(
		z.string(),
		z.intersection(BaseSetting, NonCategorySetting),
	),
});
type CategorySetting = z.infer<typeof CategorySetting>;

const WidgetSettings = z.record(z.string(), CategorySetting);
export type WidgetSettings = z.infer<typeof WidgetSettings>;

type ExtractSettingType<T extends NonCategorySetting['type']> = Extract<
	NonCategorySetting,
	{ type: T }
>;

export namespace WidgetSetting {
	export type Settings = WidgetSettings;

	export type Category = CategorySetting;
	export type NonCategory = NonCategorySetting;

	export type Section = ExtractSettingType<'section'>;
	export type MultiSection = ExtractSettingType<'multi-section'>;

	export type Button = ExtractSettingType<'button'>;

	export namespace Display {
		export type Text = ExtractSettingType<'text-display'>;
		export type Image = ExtractSettingType<'image-display'>;
	}

	export namespace Input {
		export type Text = ExtractSettingType<'text-input'>;
		export type TextArea = ExtractSettingType<'text-area-input'>;
		export type MultiText = ExtractSettingType<'multi-text-input'>;
		export type Number = ExtractSettingType<'number-input'>;
		export type Slider = ExtractSettingType<'slider-input'>;
		export type Toggle = ExtractSettingType<'toggle-input'>;
		export type Dropdown = ExtractSettingType<'dropdown-input'>;
		export type Select = ExtractSettingType<'select-input'>;
		export type MultiSelect = ExtractSettingType<'multi-select-input'>;
		export type Image = ExtractSettingType<'image-input'>;
		export type MultiImage = ExtractSettingType<'multi-image-input'>;
		export type Video = ExtractSettingType<'video-input'>;
		export type MultiVideo = ExtractSettingType<'multi-video-input'>;
		export type Audio = ExtractSettingType<'audio-input'>;
		export type MultiAudio = ExtractSettingType<'multi-audio-input'>;
		export type Color = ExtractSettingType<'color-input'>;
		export type Font = ExtractSettingType<'font-input'>;
	}
}
