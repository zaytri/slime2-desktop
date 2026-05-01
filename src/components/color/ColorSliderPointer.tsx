type ColorSliderPointerProps = {
	top?: string;
	color: string;
};

export default function ColorSliderPointer({
	top,
	color,
}: ColorSliderPointerProps) {
	return (
		<div
			className='absolute h-4.5 overflow-hidden rounded-1 border border-white bg-alpha-checkerboard shadow shadow-black/50 outline outline-zinc-400 group-focus-visible:outline-2 group-focus-visible:outline-black over:outline-2 over:outline-black'
			style={{
				top: `calc(${top} - 8px)`,
				left: '-6px',
				right: '-6px',
			}}
		>
			<div className='size-full' style={{ backgroundColor: color }}></div>
			<div className='absolute inset-0 bottom-1/2 border-t border-white/50 bg-linear-to-b from-white/40 to-white/15'></div>
		</div>
	);
}
