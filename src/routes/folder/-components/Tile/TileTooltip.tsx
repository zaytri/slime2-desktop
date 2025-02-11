import clsx from 'clsx';
import { memo } from 'react';

type WidgetTileTooltipProps = {
	position: 'above' | 'below';
};

export default memo(function TileTooltip({
	children,
	position = 'above',
}: Props.WithChildren<WidgetTileTooltipProps>) {
	return (
		<div
			className={clsx(
				'pointer-events-none absolute -inset-x-14 z-10 flex scale-0 items-center justify-center opacity-0 transition-[transform,opacity] group-over:scale-100 group-over:opacity-100',
				position === 'below'
					? 'top-[calc(100%+.75rem-4px)] origin-top'
					: 'bottom-[calc(100%+.75rem-4px)] origin-bottom',
			)}
		>
			{/* triangle border */}
			<div
				className={clsx(
					'absolute left-1/2 -translate-x-1/2 scale-150 border-8 border-black border-x-transparent opacity-50',
					position === 'below'
						? 'bottom-[calc(100%-6px)] origin-bottom border-b-[16px] border-t-transparent'
						: 'top-[calc(100%-6px)] origin-top border-t-[16px] border-b-transparent',
				)}
			></div>

			{/* contents */}
			<div className='min-w-[50%] overflow-hidden rounded-xl border-4 border-black/50'>
				<div className='relative max-w-full rounded-lg border-2 border-white bg-white/85 px-3 py-2 shadow-[inset_0_0_10px_5px] shadow-white backdrop-blur-sm'>
					<p className='break-words text-lg font-medium text-neutral-700 [text-shadow:0_0_3px_white,0_-1px_0_white]'>
						{children}
					</p>
				</div>
			</div>

			{/* triangle */}
			<div
				className={clsx(
					'absolute left-1/2 -translate-x-1/2 border-8 border-white border-x-transparent',
					position === 'below'
						? 'bottom-[calc(100%-5px)] border-b-[16px] border-t-transparent'
						: 'top-[calc(100%-5px)] border-t-[16px] border-b-transparent',
				)}
			></div>
		</div>
	);
});
