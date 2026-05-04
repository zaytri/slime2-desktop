import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import { getWidgetMediaCoreSrc } from '@/helpers/media';

type DisplayImageProps = {
	label: string;
	src: string;
	alt: string;
};

export default function DisplayImage({ label, src, alt }: DisplayImageProps) {
	const widgetId = useWidgetId();

	return (
		<div className='flex flex-col items-start gap-2 rounded-2 border-2 border-zinc-800 bg-zinc-700 p-2 font-medium text-white text-shadow-[0_1px_black]'>
			<p className='font-medium'>{label}</p>
			<img
				className='max-h-64 rounded-2'
				src={getWidgetMediaCoreSrc(widgetId, src)}
				alt={alt}
				title={alt}
			/>
		</div>
	);
}
