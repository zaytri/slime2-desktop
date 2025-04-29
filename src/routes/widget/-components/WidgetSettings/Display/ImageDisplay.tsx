import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import { getImageDisplayUrl } from '@/helpers/media';
import { useParams } from '@tanstack/react-router';
import { memo } from 'react';

const ImageDisplay = memo(function ImageDisplay(
	setting: WidgetSetting.Display.Image,
) {
	const { widgetId } = useParams({ from: '/widget/$widgetId' });

	return (
		<div className='flex flex-col items-start gap-1'>
			<p className='font-medium'>{i18nStringTransform(setting.label)}</p>
			<img
				className='rounded-2'
				src={getImageDisplayUrl(widgetId, setting.src)}
				alt={setting.alt ? i18nStringTransform(setting.alt) : undefined}
				title={setting.alt ? i18nStringTransform(setting.alt) : undefined}
			/>
		</div>
	);
});

export default ImageDisplay;
