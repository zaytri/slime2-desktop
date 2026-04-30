import clsx from 'clsx';

type ColorPreviewProps = {
	color?: string;
	innerClassName?: string;
};

export default function ColorPreview({
	color,
	className,
	innerClassName,
}: Props.WithClassName<ColorPreviewProps>) {
	return (
		<div
			className={clsx(
				'relative overflow-hidden rounded-1 border border-white bg-alpha-checkerboard outline outline-zinc-400',
				className,
			)}
		>
			<div
				className={clsx('size-full rounded-1', innerClassName)}
				style={color ? { backgroundColor: color } : undefined}
			></div>
			<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/40 to-white/15'></div>
		</div>
	);
}
