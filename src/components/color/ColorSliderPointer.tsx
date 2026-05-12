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
			className='absolute h-4.5 overflow-hidden rounded-1 bg-alpha-checkerboard shadow-md ring-2 shadow-black/50 ring-white outline -outline-offset-1 outline-black/50 group-focus-visible:ring-4 over:ring-4'
			style={{
				top: `calc(${top} - 8px)`,
				left: '-6px',
				right: '-6px',
			}}
		>
			<div className='size-full' style={{ backgroundColor: color }}></div>
			<div className='pointer-events-none absolute inset-0 bottom-1/2 border-t border-white/50 bg-linear-to-b from-white/40 to-white/15'></div>
		</div>
	);
}
