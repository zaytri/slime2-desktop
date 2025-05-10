import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';
import ImageDisplay from './Display/ImageDisplay';
import TextDisplay from './Display/TextDisplay';
import ColorInput from './Input/ColorInput';
import DropdownInput from './Input/DropdownInput';
import FontInput from './Input/FontInput';
import MediaInput from './Input/MediaInput';
import MultiMediaInput from './Input/MultiMediaInput';
import MultiSelectInput from './Input/MultiSelectInput';
import MultiTextInput from './Input/MultiTextInput';
import NumberInput from './Input/NumberInput';
import SelectInput from './Input/SelectInput';
import SliderInput from './Input/SliderInput';
import TextInput from './Input/TextInput';
import ToggleInput from './Input/ToggleInput';
import MultiSectionSetting from './MultiSectionSetting';
import SectionSetting from './SectionSetting';
import WidgetButton from './WidgetButton';

const NonCategorySetting = memo(function NonCategorySetting(
	setting: Props.WithId<WidgetSetting.NonCategory>,
) {
	switch (setting.type) {
		case 'section':
			return <SectionSetting {...setting} />;
		case 'multi-section':
			return <MultiSectionSetting {...setting} />;

		case 'button':
			return <WidgetButton {...setting} />;

		case 'number-input':
			return <NumberInput {...setting} />;
		case 'slider-input':
			return <SliderInput {...setting} />;

		case 'toggle-input':
			return <ToggleInput {...setting} />;

		case 'dropdown-input':
			return <DropdownInput {...setting} />;

		case 'select-input':
			return <SelectInput {...setting} />;
		case 'multi-select-input':
			return <MultiSelectInput {...setting} />;

		case 'font-input':
			return <FontInput {...setting} />;
		case 'color-input':
			return <ColorInput {...setting} />;

		case 'text-input':
		case 'text-area-input':
			return <TextInput {...setting} />;

		case 'multi-text-input':
			return <MultiTextInput {...setting} />;

		case 'image-input':
		case 'video-input':
		case 'audio-input':
			return <MediaInput {...setting} />;

		case 'multi-image-input':
		case 'multi-video-input':
		case 'multi-audio-input':
			return <MultiMediaInput {...setting} />;

		case 'image-display':
			return <ImageDisplay {...setting} />;

		// fallback to text display for any unexpected types
		case 'text-display':
		default:
			return <TextDisplay {...setting} type='text-display' />;
	}
});

export default NonCategorySetting;
