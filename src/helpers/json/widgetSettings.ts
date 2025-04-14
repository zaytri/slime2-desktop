// zod and types

import { z } from 'zod';
import { loadJson } from '../commands';
import { tileFolderPath } from './jsonPaths';

const localizableString = z.union([
	z.string(),
	z.record(z.string(), z.string()),
]);

const BasePlaceholder = z.object({
	placeholder: localizableString.optional(),
});

const BaseDescription = z.object({
	description: localizableString.optional(),
});

const BaseMediaDefaultValue = z.object({
	defaultValue: z.string().nullable().optional(),
});

const BaseMultipleMediaDefaultValue = z.object({
	defaultValue: z.array(z.string()).optional(),
});

const OptionValue = z.union([z.string(), z.number(), z.boolean()]);

const BaseOptions = z.object({
	options: z.array(
		z.object({
			label: localizableString.optional(),
			value: OptionValue,
		}),
	),
});

const BaseSetting = z.object({
	label: localizableString,
	id: z.string(),
});

const WidgetButton = z.object({
	type: z.literal('button'),
});

const WidgetTextDisplay = z.object({
	type: z.literal('text-display'),
});

const WidgetImageDisplay = z.object({
	type: z.literal('image-display'),
	src: z.string(),
	alt: localizableString.optional(),
});

const WidgetTextInput = z
	.object({
		type: z.literal('text-input'),
		defaultValue: z.string().optional(),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription);

const WidgetTextAreaInput = z
	.object({
		type: z.literal('text-area-input'),
		defaultValue: z.string().optional(),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription);

const WidgetMultipleTextInput = z
	.object({
		type: z.literal('multiple-text-input'),
		defaultValue: z.array(z.string()).optional(),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription);

const WidgetNumberInput = z
	.object({
		type: z.literal('number-input'),
		defaultValue: z.number().nullable().optional(),
		min: z.number().optional(),
		max: z.number().optional(),
		step: z.union([z.number(), z.literal('any')]).optional(),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription);

const WidgetSliderInput = z
	.object({
		type: z.literal('slider-input'),
		defaultValue: z.number().nullable().optional(),
		min: z.number().optional(),
		max: z.number().optional(),
		step: z.union([z.number(), z.literal('any')]).optional(),
	})
	.merge(BaseDescription);

const WidgetToggleInput = z
	.object({
		type: z.literal('toggle-input'),
		defaultValue: z.boolean().optional(),
	})
	.merge(BaseDescription);

const WidgetDropdownInput = z
	.object({
		type: z.literal('dropdown-input'),
	})
	.merge(BasePlaceholder)
	.merge(BaseDescription)
	.merge(BaseOptions)
	.merge(z.object({ defaultValue: OptionValue.optional() }));

const WidgetSelectInput = z
	.object({
		type: z.literal('select-input'),
		defaultValue: OptionValue.optional(),
	})
	.merge(BaseDescription)
	.merge(BaseOptions);

const WidgetMultipleSelectInput = z
	.object({
		type: z.literal('multiple-select-input'),
		defaultValue: z.array(OptionValue).optional(),
	})
	.merge(BaseDescription)
	.merge(BaseOptions);

const WidgetImageInput = z
	.object({
		type: z.literal('image-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMediaDefaultValue);

const WidgetMultipleImageInput = z
	.object({
		type: z.literal('multiple-image-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMultipleMediaDefaultValue);

const WidgetVideoInput = z
	.object({
		type: z.literal('video-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMediaDefaultValue);

const WidgetMultipleVideoInput = z
	.object({
		type: z.literal('multiple-video-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMultipleMediaDefaultValue);

const WidgetAudioInput = z
	.object({
		type: z.literal('audio-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMediaDefaultValue);

const WidgetMultipleAudioInput = z
	.object({
		type: z.literal('multiple-audio-input'),
	})
	.merge(BaseDescription)
	.merge(BaseMultipleMediaDefaultValue);

const ColorInput = z
	.object({
		type: z.literal('color-input'),
		defaultValue: z.string().optional(),
	})
	.merge(BaseDescription);

const FontInput = z
	.object({
		type: z.literal('font-input'),
		defaultValue: z.string().optional(),
	})
	.merge(BaseDescription);

const WidgetSetting = BaseSetting.and(
	z.discriminatedUnion('type', [
		WidgetButton,
		WidgetTextDisplay,
		WidgetImageDisplay,
		WidgetTextInput,
		WidgetTextAreaInput,
		WidgetMultipleTextInput,
		WidgetNumberInput,
		WidgetSliderInput,
		WidgetToggleInput,
		WidgetDropdownInput,
		WidgetSelectInput,
		WidgetMultipleSelectInput,
		WidgetImageInput,
		WidgetMultipleImageInput,
		WidgetVideoInput,
		WidgetMultipleVideoInput,
		WidgetAudioInput,
		WidgetMultipleAudioInput,
		ColorInput,
		FontInput,
	]),
);

const WidgetSettingsGroup = z.object({
	label: localizableString,
	id: z.string(),
	settings: z.array(WidgetSetting),
});

const WidgetSettings = z.array(WidgetSettingsGroup);
export type WidgetSettings = z.infer<typeof WidgetSettings>;

// functions

export async function loadWidgetSettings(id: string): Promise<WidgetSettings> {
	const path = await settingsPath(id);
	const settings = await WidgetSettings.parseAsync(await loadJson(path));
	return settings;
}

async function settingsPath(id: string) {
	const folderPath = await tileFolderPath(id);
	return `${folderPath}/core/config/settings`;
}
