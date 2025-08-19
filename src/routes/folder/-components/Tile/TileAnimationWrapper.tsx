import { memo } from 'react';

const TileAnimationWrapper = memo(function TileAnimationWrapper({
	children,
}: Props.WithChildren) {
	return (
		<div className='relative aspect-9/8 w-3/4 min-w-36'>
			<div className='ease-bounce group-over:z-10 group-over:scale-125 absolute inset-0 transition-transform duration-200'>
				{children}
			</div>
		</div>
	);
});

export default TileAnimationWrapper;
