import ArrowDownSvg from '@/components/svg/ArrowDownSvg';
import { Link } from '@tanstack/react-router';
import { memo } from 'react';

const ExitFolderButton = memo(function ExitFolderButton() {
	return (
		<Link
			to='/'
			className='group font-fredoka over:scale-125 over:gap-4 over:bg-none over:text-3xl flex h-16 origin-bottom items-center gap-0 rounded-t-2xl border-4 border-b-0 border-amber-900 bg-amber-300 bg-linear-to-b from-amber-200 from-50% to-amber-300 to-50% px-8 text-[.1px] font-medium text-amber-900 transition-[gap,transform]'
		>
			<ArrowDownSvg className='size-8' />
			<span className='group-over:opacity-100 opacity-0 transition-[font-size,opacity]'>
				Exit Folder
			</span>
		</Link>
	);
});

export default ExitFolderButton;
