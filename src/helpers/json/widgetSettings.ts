import { z } from 'zod/mini';
import { loadJson, saveJson } from '../commands';
import { I18nString } from '../i18n';
import { refetchQuery } from '../queryClient';
import logZodError from '../zodError';
import { tileFolderPath } from './jsonPaths';

// functions

export async function loadWidgetSettings(id: string): Promise<WidgetSettings> {
	const json = await loadJson(await widgetSettingsPath(id));
	try {
		const data = WidgetSettings.parse(json);
		return data;
	} catch (error) {
		logZodError(error, json);
		throw error;
	}
}

// saves and reloads settings (from useWidgetSettingsQuery)
export async function updateWidgetSettings(
	id: string,
	settings: WidgetSettings,
): Promise<void> {
	const path = await widgetSettingsPath(id);
	await saveJson(settings, path);
	return refetchQuery(['widgetSettings', id]);
}

async function widgetSettingsPath(id: string) {
	const folderPath = await tileFolderPath(id);
	return `${folderPath}/core/config/settings`;
}

// consts

export const SETTINGS_DATA: SettingsData = {
	section: { label: 'Section', defaultData: { type: 'section', settings: {} } },
	'multi-section': {
		label: 'Multi-Section',
		defaultData: { type: 'multi-section', settings: {} },
	},
	button: { label: 'Button', defaultData: { type: 'button' } },
	'text-display': {
		label: 'Text Display',
		defaultData: { type: 'text-display' },
	},
	'image-display': {
		label: 'Image Display',
		defaultData: { type: 'image-display', alt: '', src: '' },
	},
	'text-input': { label: 'Text Input', defaultData: { type: 'text-input' } },
	'text-area-input': {
		label: 'Text Area Input',
		defaultData: { type: 'text-area-input' },
	},
	'color-input': { label: 'Color Input', defaultData: { type: 'color-input' } },
	'font-input': { label: 'Font Input', defaultData: { type: 'font-input' } },
	'multi-text-input': {
		label: 'Multi-Text Input',
		defaultData: { type: 'multi-text-input' },
	},
	'number-input': {
		label: 'Number Input',
		defaultData: { type: 'number-input' },
	},
	'slider-input': {
		label: 'Slider Input',
		defaultData: { type: 'slider-input', min: 0, max: 100, step: 1 },
	},
	'toggle-input': {
		label: 'Toggle Input',
		defaultData: { type: 'toggle-input', defaultValue: false },
	},
	'dropdown-input': {
		label: 'Dropdown Input',
		defaultData: { type: 'dropdown-input', options: [] },
	},
	'select-input': {
		label: 'Select Input',
		defaultData: { type: 'select-input', options: [] },
	},
	'multi-select-input': {
		label: 'Multi-Select Input',
		defaultData: { type: 'multi-select-input', options: [] },
	},
	'image-input': { label: 'Image Input', defaultData: { type: 'image-input' } },
	'audio-input': { label: 'Audio Input', defaultData: { type: 'audio-input' } },
	'video-input': { label: 'Video Input', defaultData: { type: 'video-input' } },
	'multi-image-input': {
		label: 'Multi-Image Input',
		defaultData: { type: 'multi-image-input' },
	},
	'multi-audio-input': {
		label: 'Multi-Audio Input',
		defaultData: { type: 'multi-audio-input' },
	},
	'multi-video-input': {
		label: 'Multi-Video Input',
		defaultData: { type: 'multi-video-input' },
	},
};

export const SECTION_SETTING_GROUPED_OPTIONS: GroupedOptions<
	WidgetSetting.NonGroup['type']
>[] = (
	[
		['String', ['text-input', 'text-area-input', 'multi-text-input']],
		['Style', ['color-input', 'font-input']],
		['Number', ['number-input', 'slider-input']],
		['Boolean', ['toggle-input']],
		['Options', ['dropdown-input', 'select-input', 'multi-select-input']],
		[
			'Media',
			[
				'image-input',
				'audio-input',
				'video-input',
				'multi-image-input',
				'multi-audio-input',
				'multi-video-input',
			],
		],
		['Other', ['text-display', 'button']],
	] satisfies [string, WidgetSetting.NonGroup['type'][]][]
).map(([groupLabel, types]) => {
	return {
		label: groupLabel,
		options: types.map(type => {
			return { label: SETTINGS_DATA[type].label, value: type };
		}),
	};
});

export const SECTION_SETTING_OPTIONS = SECTION_SETTING_GROUPED_OPTIONS.reduce(
	(options: Option<WidgetSetting.NonGroup['type']>[], group) => {
		return [...options, ...group.options];
	},
	[],
);

const SECTIONS: WidgetSetting.AnySection['type'][] = [
	'section',
	'multi-section',
];

export const SECTION_OPTIONS: Option<WidgetSetting.AnySection['type']>[] =
	SECTIONS.map(type => {
		return { label: SETTINGS_DATA[type].label, value: type };
	});

export const CATEGORY_SETTING_GROUPED_OPTIONS: GroupedOptions<
	WidgetSetting.NonCategory['type']
>[] = [
	{ label: 'Group', options: SECTION_OPTIONS },
	...SECTION_SETTING_GROUPED_OPTIONS,
];

export const CATEGORY_SETTING_OPTIONS = CATEGORY_SETTING_GROUPED_OPTIONS.reduce(
	(options: Option<WidgetSetting.NonCategory['type']>[], group) => {
		return [...options, ...group.options];
	},
	[],
);

// zod and types

const Placeholder = z.optional(I18nString);
const Description = z.optional(I18nString);

const MediaDefaultValue = z.optional(z.string());
const MultiMediaDefaultValue = z.optional(z.array(z.string()));

const OptionValue = z.union([z.string(), z.number(), z.boolean()]);

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

const BaseNonGroupSetting = z.object({
	...BaseSetting.def.shape,
	halfSpan: z.optional(z.boolean()),
});

const ButtonSetting = z.object({
	type: z.literal('button'),
	...BaseNonGroupSetting.def.shape,
});

const TextDisplaySetting = z.object({
	type: z.literal('text-display'),
	...BaseNonGroupSetting.def.shape,
});

const ImageDisplaySetting = z.object({
	type: z.literal('image-display'),
	...BaseNonGroupSetting.def.shape,
	src: z.string(),
	alt: I18nString,
});

const TextInputSetting = z.object({
	type: z.literal('text-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(z.string()),
	placeholder: Placeholder,
	description: Description,
});

const TextAreaInputSetting = z.object({
	type: z.literal('text-area-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(z.string()),
	placeholder: Placeholder,
	description: Description,
});

const MultiTextInputSetting = z.object({
	type: z.literal('multi-text-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(z.array(z.string())),
	placeholder: Placeholder,
	description: Description,
});

const NumberInputSetting = z.object({
	type: z.literal('number-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(z.number()),
	min: z.optional(z.number()),
	max: z.optional(z.number()),
	step: z.optional(z.union([z.number(), z.literal('any')])),
	placeholder: Placeholder,
	description: Description,
});

const SliderInputSetting = z.object({
	type: z.literal('slider-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(z.number()),
	min: z.optional(z.number()),
	max: z.optional(z.number()),
	step: z.optional(z.union([z.number(), z.literal('any')])),
	description: Description,
});

const ToggleInputSetting = z.object({
	type: z.literal('toggle-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(z.boolean()),
	description: Description,
});

const DropdownInputSetting = z.object({
	type: z.literal('dropdown-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(OptionValue),
	placeholder: Placeholder,
	description: Description,
	options: Options,
});

const SelectInputSetting = z.object({
	type: z.literal('select-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(OptionValue),
	description: Description,
	options: Options,
});

const MultiSelectInputSetting = z.object({
	type: z.literal('multi-select-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(z.array(OptionValue)),
	description: Description,
	options: Options,
});

const ImageInputSetting = z.object({
	type: z.literal('image-input'),
	...BaseNonGroupSetting.def.shape,
	description: Description,
	defaultValue: MediaDefaultValue,
});

const MultiImageInputSetting = z.object({
	type: z.literal('multi-image-input'),
	...BaseNonGroupSetting.def.shape,
	description: Description,
	defaultValue: MultiMediaDefaultValue,
});

const VideoInputSetting = z.object({
	type: z.literal('video-input'),
	...BaseNonGroupSetting.def.shape,
	description: Description,
	defaultValue: MediaDefaultValue,
});

const MultiVideoInputSetting = z.object({
	type: z.literal('multi-video-input'),
	...BaseNonGroupSetting.def.shape,
	description: Description,
	defaultValue: MultiMediaDefaultValue,
});

const AudioInputSetting = z.object({
	type: z.literal('audio-input'),
	...BaseNonGroupSetting.def.shape,
	description: Description,
	defaultValue: MediaDefaultValue,
});

const MultiAudioInputSetting = z.object({
	type: z.literal('multi-audio-input'),
	...BaseNonGroupSetting.def.shape,
	description: Description,
	defaultValue: MultiMediaDefaultValue,
});

const ColorInputSetting = z.object({
	type: z.literal('color-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(z.string()),
	description: Description,
	placeholder: Placeholder,
});

const FontInputSetting = z.object({
	type: z.literal('font-input'),
	...BaseNonGroupSetting.def.shape,
	defaultValue: z.optional(z.string()),
	description: Description,
	placeholder: Placeholder,
});

const NonGroupSetting = z.discriminatedUnion('type', [
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
	...BaseSetting.def.shape,
	settings: z.record(z.string(), NonGroupSetting),
});

const MultiSectionSetting = z.object({
	type: z.literal('multi-section'),
	...BaseSetting.def.shape,
	settings: z.record(z.string(), NonGroupSetting),
});

const NonCategorySetting = z.discriminatedUnion('type', [
	...NonGroupSetting.def.options,
	SectionSetting,
	MultiSectionSetting,
]);

type NonCategorySetting = z.infer<typeof NonCategorySetting>;

const CategorySetting = z.object({
	label: I18nString,
	settings: z.record(z.string(), NonCategorySetting),
});
type CategorySetting = z.infer<typeof CategorySetting>;

const WidgetSettings = z.record(z.string(), CategorySetting);
export type WidgetSettings = z.infer<typeof WidgetSettings>;

type ExtractSettingType<T extends NonCategorySetting['type']> = Extract<
	NonCategorySetting,
	{ type: T }
>;

export namespace WidgetSetting {
	export type BaseSetting = z.infer<typeof BaseSetting>;
	export type OptionValue = z.infer<typeof OptionValue>;
	export type Options = z.infer<typeof Options>;
	export type Condition = BaseSetting['condition'];
	export type SearchTags = BaseSetting['searchTags'];

	export type Settings = WidgetSettings;

	export type Category = CategorySetting;
	export type NonCategory = NonCategorySetting;
	export type NonGroup = z.infer<typeof NonGroupSetting>;

	export type Section = ExtractSettingType<'section'>;
	export type MultiSection = ExtractSettingType<'multi-section'>;
	export type AnySection = Section | MultiSection;

	export type Button = ExtractSettingType<'button'>;

	export namespace Display {
		export type Text = ExtractSettingType<'text-display'>;
		export type Image = ExtractSettingType<'image-display'>;
	}

	export type AnyInput = WidgetSetting.Input.Any;
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

		export type Any =
			| Text
			| TextArea
			| MultiText
			| Number
			| Slider
			| Toggle
			| Dropdown
			| Select
			| MultiSelect
			| Image
			| MultiImage
			| Video
			| MultiVideo
			| Audio
			| MultiAudio
			| Color
			| Font;
	}
}

type SettingsData = {
	[SettingType in WidgetSetting.NonCategory['type']]: SettingType extends WidgetSetting.NonCategory['type']
		? {
				label: string;
				defaultData: Extract<
					DistributiveOmit<WidgetSetting.NonCategory, 'label'>,
					{ type: SettingType }
				>;
			}
		: never;
};
