import { memo } from 'react';

type ColorSliderPointerProps = {
	left?: string;
	color: string;
};

const ColorSliderPointer = memo(function ColorSliderPointer({
	left,
	color,
}: ColorSliderPointerProps) {
	return (
		<div
			className='rounded-1 bg-alpha-checkerboard absolute w-4 overflow-hidden border border-white shadow shadow-black/50 outline outline-stone-400 group-focus-visible:outline-2 group-focus-visible:outline-black'
			style={{
				left: `calc(${left} - 8px)`,
				top: '-4px',
				bottom: '-4px',
			}}
		>
			<div className='size-full' style={{ backgroundColor: color }}></div>
			<div className='absolute inset-0 bottom-1/2 border-t border-white/50 bg-gradient-to-b from-white/40 to-white/15'></div>
		</div>
	);
});

export default ColorSliderPointer;
