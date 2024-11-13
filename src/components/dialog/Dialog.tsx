import { useDialog } from '@/contexts/dialog/useDialog';
import { memo } from 'react';
import CloseSvg from '../svg/CloseSvg';

export default memo(function Dialog({ children }: Props.WithChildren) {
	const { close } = useDialog();

	return (
		<div className='absolute inset-0 flex items-center justify-center'>
			<div className='animate-bounce-in overflow-hidden rounded-xl border-4 border-black/50'>
				<div className='flex min-h-48 min-w-96 flex-col border-2 border-white bg-white/90 p-4 shadow-[inset_0_0_10px_5px] shadow-white'>
					{/* close button */}
					<button
						type='button'
						className='group absolute flex h-8 items-center gap-0 self-end rounded-lg border-2 border-rose-800 bg-rose-400 bg-gradient-to-b from-rose-300 from-50% to-rose-400 to-50% px-2 font-bold text-rose-900 shadow-[0_2px] shadow-rose-800 transition-[gap] over:translate-y-[2px] over:gap-2 over:bg-none over:shadow-none'
						onClick={close}
					>
						<span className='text-[.1px] opacity-0 transition-[font-size] group-over:text-lg group-over:opacity-100'>
							Close
						</span>
						<CloseSvg className='size-4' />
					</button>

					{/* contents */}
					{children}
				</div>
			</div>
		</div>
	);
});
