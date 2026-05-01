import clsx from 'clsx';

type HeaderButtonProps = {
	icon: SvgComponent;
	label: string;
	onClick: VoidFunction;
};

export default function HeaderButton({
	onClick,
	icon: Icon,
	className,
	label,
}: Props.WithClassName<HeaderButtonProps>) {
	return (
		<button
			type='button'
			className={clsx(
				'relative flex overflow-hidden rounded-2 border bg-linear-to-b px-2 py-1 font-fredoka text-5 font-medium over:bg-none over:outline-4 over:outline-offset-4',
				className,
			)}
			onClick={onClick}
		>
			<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
			<div className='relative flex flex-1 items-center gap-2.5 drop-shadow-[0_1px_3px_#FFFB]'>
				<Icon className='size-5' />
				<p>{label}</p>
			</div>
		</button>
	);
}
