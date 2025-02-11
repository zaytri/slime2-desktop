import { memo } from 'react';

type TileActionProps = {
	action: string;
};

export default memo(function TileAction({ action }: TileActionProps) {
	return (
		<div className='pointer-events-none absolute inset-0 z-50 overflow-hidden will-change-contents'>
			{/* yellow bg */}
			<div className='absolute -inset-x-4 -bottom-2 flex h-14 origin-bottom scale-0 items-center justify-center overflow-hidden rounded-t-100% bg-gradient-to-b from-amber-200 to-amber-300 backdrop-blur-[2px] transition-transform duration-200 group-over:flex group-over:scale-100'>
				{/* text */}
				<p className='relative mb-2 text-lg font-bold text-amber-900 shadow-amber-200 [text-shadow:0_1px_0_var(--tw-shadow-color)]'>
					{action}
				</p>
			</div>
		</div>
	);
});
