import { memo } from 'react';

type ColorGridPointerProps = {
	left?: string;
	top?: string;
	color: string;
};

const ColorGridPointer = memo(function ColorGridPointer({
	left,
	top,
	color,
}: ColorGridPointerProps) {
	return (
		<div
			className='absolute size-6 overflow-hidden rounded-full shadow-[0_0_0_1px_white,_0_0_0_2px_var(--color-stone-400)] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-black'
			style={{ top: `calc(${top} - 12px)`, left: `calc(${left} - 12px)` }}
		>
			<div className='size-full' style={{ backgroundColor: color }}></div>
			<div className='rounded-b-100% absolute inset-0 bottom-5/12 border-t border-white/50 bg-gradient-to-b from-white/40 to-white/15'></div>
		</div>
	);
});

export default ColorGridPointer;
