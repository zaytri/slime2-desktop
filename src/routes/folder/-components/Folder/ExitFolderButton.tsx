import DownSvg from '@/components/svg/DownSvg';
import { Link } from '@tanstack/react-router';
import { memo } from 'react';

export default memo(function ExitFolderButton() {
	return (
		<Link
			to='/'
			className='group flex h-16 origin-bottom items-center gap-0 rounded-t-2xl border-4 border-b-0 border-amber-900 bg-amber-300 bg-gradient-to-b from-amber-200 from-50% to-amber-300 to-50% px-8 font-fredoka text-[.1px] font-medium text-amber-900 transition-[gap,transform] over:scale-125 over:gap-4 over:bg-none over:text-3xl'
		>
			<DownSvg className='size-8' />
			<span className='opacity-0 transition-[font-size,opacity] group-over:opacity-100'>
				Exit Folder
			</span>
		</Link>
	);
});
