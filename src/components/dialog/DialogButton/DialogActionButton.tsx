import clsx from 'clsx';

type DialogActionButton = {
	onClick: VoidFunction;
	disabled?: boolean;
};

export default function DialogActionButton({
	onClick,
	className,
	children,
	disabled,
}: Props.WithClassNameAndChildren<DialogActionButton>) {
	return (
		<button
			type='button'
			className={clsx(
				'relative flex overflow-hidden rounded-2 border bg-linear-to-b px-2 py-1.5 font-fredoka text-4.5 font-medium outline-2 outline-offset-0! disabled:border-none disabled:bg-zinc-100 disabled:bg-none disabled:text-zinc-400 disabled:outline-zinc-400 over:bg-none over:outline-4 over:-outline-offset-1!',
				className,
			)}
			onClick={onClick}
			disabled={disabled}
		>
			<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
			<div className='relative flex flex-1 items-center justify-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
				{children}
			</div>
		</button>
	);
}
