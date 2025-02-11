import LeftSvg from '@/components/svg/LeftSvg';
import RightSvg from '@/components/svg/RightSvg';
import clsx from 'clsx';
import { memo } from 'react';

type Props = {
	direction: 'left' | 'right';
	onClick: () => void;
};

export default memo(function ChangePageButton({ direction, onClick }: Props) {
	const children = (
		<div className='flex items-center gap-0 pt-1 font-fredoka text-[.1px] font-medium transition-[gap] group-over:gap-4 group-over:text-3xl'>
			{direction === 'left' ? (
				<>
					<LeftSvg className='size-8' />
					<span className='pb-1 opacity-0 transition-[font-size,opacity] group-over:opacity-100'>
						Previous<span className='sr-only'> Page</span>
					</span>
				</>
			) : (
				<>
					<span className='pb-1 opacity-0 transition-[font-size,opacity] group-over:opacity-100'>
						Next<span className='sr-only'> Page</span>
					</span>
					<RightSvg className='size-8' />
				</>
			)}
		</div>
	);

	return (
		<button
			type='button'
			className={clsx(
				'group flex h-16 items-center border-t-4 border-amber-900 bg-amber-300 bg-gradient-to-b from-amber-200 from-50% to-amber-300 to-50% px-6 text-amber-900 transition-transform over:scale-125 over:bg-none',
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
