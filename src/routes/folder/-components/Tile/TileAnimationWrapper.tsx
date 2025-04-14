import { memo } from 'react';

const TileAnimationWrapper = memo(function TileAnimationWrapper({
	children,
}: Props.WithChildren) {
	return (
		<div className='ease-bounce group-over:z-10 group-over:scale-125 absolute inset-0 transition-transform duration-200'>
			{children}
		</div>
	);
});

export default TileAnimationWrapper;
