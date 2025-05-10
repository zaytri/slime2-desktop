import LinkifyText from '@/components/LinkifyText';
import { WidgetMeta } from '@/helpers/json/widgetMeta';
import { getWidgetIconSrc } from '@/helpers/media';
import { useParams } from '@tanstack/react-router';
import { memo } from 'react';

const WidgetInfo = memo(function WidgetInfo(meta: Props.WithId<WidgetMeta>) {
	const { widgetId } = useParams({ from: '/widget/$widgetId' });

	const values = [
		['Creator', meta.creator],
		['Support', meta.support],
		['Homepage', meta.homepage],
	];

	return (
		<div id={meta.id} className='flex items-center gap-4 p-4'>
			<div className='flex flex-1 flex-col gap-2'>
				<h2 className='text-7 border-b border-stone-400 font-medium'>
					{meta.name} <span className='text-stone-400'>v{meta.version}</span>
				</h2>

				{values.map(([label, value]) => {
					if (!value) return null;

					return (
						<div className='flex flex-col'>
							<p className='text-3 font-semibold text-stone-400 uppercase'>
								{label}
							</p>
							<LinkifyText
								className='text-4.5 font-medium'
								linkClassName='text-lime-600'
							>
								{value}
							</LinkifyText>
						</div>
					);
				})}
			</div>

			{meta.icon && (
				<img
					src={getWidgetIconSrc(widgetId, meta.icon)}
					className='rounded-2 max-h-48 max-w-48 bg-rose-200 object-contain'
				/>
			)}
		</div>
	);
});

export default WidgetInfo;
