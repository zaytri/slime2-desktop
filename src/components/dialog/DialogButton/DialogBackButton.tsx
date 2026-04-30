import { memo } from 'react';
import ArrowLeftSvg from '../../svg/ArrowLeftSvg';

type DialogBackButtonProps = {
	onClick: VoidFunction;
};

const DialogBackButton = memo(function DialogBackButton({
	onClick,
}: DialogBackButtonProps) {
	return (
		<button
			type='button'
			className='relative flex overflow-hidden rounded-2 border-t border-b border-t-cyan-100 border-b-sky-600 bg-cyan-300 bg-linear-to-b from-cyan-300 to-sky-400 px-2 text-4.5 font-bold text-sky-900 outline-2 outline-sky-800 over:outline-4'
			onClick={onClick}
		>
			<div className='absolute inset-0 bottom-[45%] bg-linear-to-b from-white/30 to-white/20'></div>
			<div className='relative flex flex-1 items-center gap-3 drop-shadow-[0_1px_3px_#FFFB]'>
				<ArrowLeftSvg className='size-4' />
				<p>Back</p>
			</div>
		</button>
	);
});

export default DialogBackButton;
