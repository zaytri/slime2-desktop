import { memo } from 'react';

type ColorGridPointerProps = {
	left?: string | number;
	top?: string | number;
	color: string;
};

const ColorGridPointer = memo(function ColorGridPointer({
	left,
	top,
	color,
}: ColorGridPointerProps) {
	return (
		<div
			className='absolute size-6 overflow-hidden rounded-full shadow-[0_0_0_2px_white,0_0_0_3px_var(--color-zinc-500)] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-black over:outline-2 over:outline-offset-2 over:outline-black'
			style={{ top: `calc(${top} - 12px)`, left: `calc(${left} - 12px)` }}
		>
			<div className='size-full' style={{ backgroundColor: color }}></div>
			<div className='absolute inset-0 bottom-5/12 rounded-b-100% border-t border-white/50 bg-linear-to-b from-white/40 to-white/15'></div>
		</div>
	);
});

export default ColorGridPointer;
