import clsx from 'clsx';
import { memo } from 'react';

type HeaderButtonProps = {
	icon: React.ReactNode;
	label: string;
	onClick: VoidFunction;
};

const HeaderButton = memo(function HeaderButton({
	onClick,
	icon,
	className,
	label,
}: Props.WithClassName<HeaderButtonProps>) {
	return (
		<button
			type='button'
			className={clsx(
				'relative flex overflow-hidden rounded-2 border bg-linear-to-b p-2 text-4.5 font-bold over:bg-none over:outline-4 over:outline-offset-4',
				className,
			)}
			onClick={onClick}
		>
			<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
			<div className='relative flex flex-1 items-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
				{icon}
				<p className='-mb-0.5'>{label}</p>
			</div>
		</button>
	);
});

export default HeaderButton;
