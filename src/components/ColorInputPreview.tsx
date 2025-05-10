import clsx from 'clsx';
import { memo } from 'react';

type ColorInputPreviewProps = {
	color?: string;
};

const ColorInputPreview = memo(function ColorInputPreview({
	color,
	className,
}: Props.WithClassName<ColorInputPreviewProps>) {
	return (
		<div
			className={clsx(
				'rounded-1 bg-alpha-checkerboard relative my-1 size-8.5 overflow-hidden border border-white outline outline-stone-400',
				className,
			)}
		>
			<div className='size-full' style={{ backgroundColor: color }}></div>
			<div className='absolute inset-0 bottom-1/2 bg-gradient-to-b from-white/40 to-white/15'></div>
		</div>
	);
});

export default ColorInputPreview;
