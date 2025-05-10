import LinkifyText from '@/components/LinkifyText';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { memo } from 'react';

const TextDisplay = memo(function TextDisplay(
	setting: Props.WithId<WidgetSetting.Display.Text>,
) {
	return (
		<div className='rounded-2 border border-white bg-stone-100 px-2 py-1 outline outline-stone-300'>
			<LinkifyText>{i18nStringTransform(setting.label)}</LinkifyText>
		</div>
	);
});

export default TextDisplay;
