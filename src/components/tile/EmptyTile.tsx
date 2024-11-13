import { memo } from 'react';
import CreateSvg from '../svg/CreateSvg';

export default memo(function EmptyTile() {
	return (
		<div className='absolute inset-0 flex items-center justify-center'>
			<div className='relative mb-10 size-12 origin-bottom scale-0 text-amber-200 transition-transform group-over:scale-100'>
				<div className='absolute inset-2.5 rounded-100% bg-gradient-to-b from-amber-800 to-amber-900'></div>
				<CreateSvg className='relative' />
			</div>
		</div>
	);
});
