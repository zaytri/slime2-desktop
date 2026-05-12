type ColorGridPointerProps = {
	left?: string | number;
	top?: string | number;
	color: string;
};

export default function ColorGridPointer({
	left,
	top,
	color,
}: ColorGridPointerProps) {
	return (
		<div
			className='group-focus-visible:outline-ring-2 absolute z-10 size-6 overflow-hidden rounded-full shadow ring-2 shadow-black ring-black/25 outline-2 -outline-offset-1 outline-white group-focus-visible:ring-5 group-focus-visible:outline-3 over:ring-5 over:outline-3'
			style={{ top: `calc(${top} - 12px)`, left: `calc(${left} - 12px)` }}
		>
			<div className='size-full' style={{ backgroundColor: color }}></div>
			<div className='absolute inset-0 bottom-5/12 rounded-b-100% border-t border-white/50 bg-linear-to-b from-white/40 to-white/15'></div>
		</div>
	);
}
