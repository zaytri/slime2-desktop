import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import { getWidgetMediaCoreSrc } from '@/helpers/media';
import { memo } from 'react';

type DisplayImageProps = {
	label: string;
	src: string;
	alt: string;
};

const DisplayImage = memo(function DisplayImage({
	label,
	src,
	alt,
}: DisplayImageProps) {
	const widgetId = useWidgetId();

	return (
		<div className='flex flex-col items-start gap-2 rounded-2 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 p-2 font-medium outline-2 outline-zinc-300'>
			<p className='font-medium'>{label}</p>
			<img
				className='max-h-64 rounded-2'
				src={getWidgetMediaCoreSrc(widgetId, src)}
				alt={alt}
				title={alt}
			/>
		</div>
	);
});

export default DisplayImage;
