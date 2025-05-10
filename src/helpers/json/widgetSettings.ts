import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import { loadJson } from '../commands';
import { I18nString } from '../i18n';
import { tileFolderPath } from './jsonPaths';

// functions

export async function loadWidgetSettings(id: string): Promise<WidgetSettings> {
	const path = await settingsPath(id);
	try {
		const settings = await WidgetSettings.parseAsync(await loadJson(path));
		return settings;
	} catch (error) {
		const validationError = fromError(error);
		console.error(validationError.toString());
		throw error;
	}
}

async function settingsPath(id: string) {
	const folderPath = await tileFolderPath(id);
	return `${folderPath}/core/config/settings`;
}

// zod and types

const BasePlaceholder = z.object({
	placeholder: I18nString.optional(),
});

const BaseDescription = z.object({
	description: I18nString.optional(),
});

const BaseMediaDefaultValue = z.object({
	defaultValue: z.string().optional(),
});

const BaseMultipleMediaDefaultValue = z.object({
	defaultValue: z.array(z.string()).optional(),
});

const OptionValue = z.union([z.string(), z.number(), z.boolean()]);
export type OptionValue = z.infer<typeof OptionValue>;

const BaseOptions = z.object({
	options: z.array(
		z.object({
			label: I18nString,
			value: OptionValue,
		}),
	),
});

const BaseSetting = z.object({
	label: I18nString,
	condition: z.record(z.string(), OptionValue).optional(),
	searchTags: z.array(z.string()).optional(),
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

const TextInputSetting = z
	.object({
		type: z.literal('text-input'),
		defaultValue: z.string().optional(),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription);

const TextAreaInputSetting = z
	.object({
		type: z.literal('text-area-input'),
		defaultValue: z.string().optional(),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription);

const MultiTextInputSetting = z
	.object({
		type: z.literal('multi-text-input'),
		defaultValue: z.array(z.string()).optional(),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription);

const NumberInputSetting = z
	.object({
		type: z.literal('number-input'),
		defaultValue: z.number().optional(),
		min: z.number().optional(),
		max: z.number().optional(),
		step: z.union([z.number(), z.literal('any')]).optional(),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription);

const SliderInputSetting = z
	.object({
		type: z.literal('slider-input'),
		defaultValue: z.number().optional(),
		min: z.number().optional(),
		max: z.number().optional(),
		step: z.union([z.number(), z.literal('any')]).optional(),
	})
	.merge(BaseDescription);

const ToggleInputSetting = z
	.object({
		type: z.literal('toggle-input'),
		defaultValue: z.boolean().optional(),
	})
	.merge(BaseDescription);

const DropdownInputSetting = z
	.object({
		type: z.literal('dropdown-input'),
		defaultValue: OptionValue.optional(),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription)
	.merge(BaseOptions);

const SelectInputSetting = z
	.object({
		type: z.literal('select-input'),
		defaultValue: OptionValue.optional(),
	})
	.merge(BaseDescription)
	.merge(BaseOptions);

const MultiSelectInputSetting = z
	.object({
		type: z.literal('multi-select-input'),
		defaultValue: z.array(OptionValue).optional(),
	})
	.merge(BaseDescription)
	.merge(BaseOptions);

const ImageInputSetting = z
	.object({
		type: z.literal('image-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMediaDefaultValue);

const MultiImageInputSetting = z
	.object({
		type: z.literal('multi-image-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMultipleMediaDefaultValue);

const VideoInputSetting = z
	.object({
		type: z.literal('video-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMediaDefaultValue);

const MultiVideoInputSetting = z
	.object({
		type: z.literal('multi-video-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMultipleMediaDefaultValue);

const AudioInputSetting = z
	.object({
		type: z.literal('audio-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMediaDefaultValue);

const MultiAudioInputSetting = z
	.object({
		type: z.literal('multi-audio-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMultipleMediaDefaultValue);

const ColorInputSetting = z
	.object({
		type: z.literal('color-input'),
		defaultValue: z.string().optional(),
	})
	.merge(BaseDescription)
	.merge(BasePlaceholder);

const FontInputSetting = z
	.object({
		type: z.literal('font-input'),
		defaultValue: z.string().optional(),
	})
	.merge(BaseDescription)
	.merge(BasePlaceholder);

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
	settings: z.record(z.string(), BaseSetting.and(BaseSectionSetting)),
});

const MultiSectionSetting = z.object({
	type: z.literal('multi-section'),
	settings: z.record(z.string(), BaseSetting.and(BaseSectionSetting)),
});

const BaseCategorySetting = z.discriminatedUnion('type', [
	...BaseSectionSetting.options,
	SectionSetting,
	MultiSectionSetting,
]);

const NonCategorySetting = BaseSetting.and(BaseCategorySetting);
type NonCategorySetting = z.infer<typeof NonCategorySetting>;

const CategorySetting = z.object({
	label: I18nString,
	settings: z.record(z.string(), BaseSetting.and(NonCategorySetting)),
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
