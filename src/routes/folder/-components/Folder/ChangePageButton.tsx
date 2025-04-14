import ArrowLeftSvg from '@/components/svg/ArrowLeftSvg';
import ArrowRightSvg from '@/components/svg/ArrowRightSvg';
import clsx from 'clsx';
import { memo } from 'react';

type Props = {
	direction: 'left' | 'right';
	onClick: VoidFunction;
};

const ChangePageButton = memo(function ChangePageButton({
	direction,
	onClick,
}: Props) {
	const children = (
		<div className='font-fredoka group-over:gap-4 group-over:text-3xl flex items-center gap-0 pt-1 text-[.1px] font-medium transition-[gap]'>
			{direction === 'left' ? (
				<>
					<ArrowLeftSvg className='size-8' />
					<span className='group-over:opacity-100 pb-1 opacity-0 transition-[font-size,opacity]'>
						Previous Page
					</span>
				</>
			) : (
				<>
					<span className='group-over:opacity-100 pb-1 opacity-0 transition-[font-size,opacity]'>
						Next Page
					</span>
					<ArrowRightSvg className='size-8' />
				</>
			)}
		</div>
	);

	return (
		<button
			type='button'
			className={clsx(
				'group over:scale-125 over:bg-none flex h-16 items-center border-t-4 border-amber-900 bg-amber-300 bg-linear-to-b from-amber-200 from-50% to-amber-300 to-50% px-6 text-amber-900 transition-transform',
				direction === 'left'
					? 'origin-bottom-left justify-start rounded-tr-2xl border-r-4'
					: 'origin-bottom-right justify-end rounded-tl-2xl border-l-4',
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
});

export default ChangePageButton;
