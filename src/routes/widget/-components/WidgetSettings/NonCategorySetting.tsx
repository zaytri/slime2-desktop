import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';
import ImageDisplay from './Display/ImageDisplay';
import TextDisplay from './Display/TextDisplay';
import MultiTextInput from './Input/MultiTextInput';
import NumberInput from './Input/NumberInput';
import SliderInput from './Input/SliderInput';
import TextAreaInput from './Input/TextAreaInput';
import TextInput from './Input/TextInput';
import SectionSetting from './SectionSetting';
import WidgetButton from './WidgetButton';

const NonCategorySetting = memo(function NonCategorySetting(
	setting: WidgetSetting.Setting,
) {
	switch (setting.type) {
		case 'button':
			return <WidgetButton {...setting} />;
		case 'image-display':
			return <ImageDisplay {...setting} />;
		case 'text-input':
			return <TextInput {...setting} />;
		case 'section':
			return <SectionSetting {...setting} />;
		case 'text-area-input':
			return <TextAreaInput {...setting} />;
		case 'multi-text-input':
			return <MultiTextInput {...setting} />;
		case 'number-input':
			return <NumberInput {...setting} />;
		case 'slider-input':
			return <SliderInput {...setting} />;
		case 'toggle-input':
		case 'dropdown-input':
		case 'select-input':
		case 'multi-select-input':
		case 'image-input':
		case 'multi-image-input':
		case 'video-input':
		case 'multi-video-input':
		case 'audio-input':
		case 'multi-audio-input':
		case 'color-input':
		case 'font-input':
		case 'multi-section':

		// fallback to text display for any unexpected types
		case 'text-display':
		default:
			return <TextDisplay {...setting} type='text-display' />;
	}
});

export default NonCategorySetting;
