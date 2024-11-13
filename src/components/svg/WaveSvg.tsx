import { memo } from 'react';

export default memo(function WaveSvg({ className }: Props.WithClassName) {
	return (
		<div className={className}>
			<svg viewBox='0 0 400 400' fill='currentColor'>
				<path d='M-43.73,256.09 C131.20,-133.69 225.45,508.72 500.84,37.02 L500.00,0.00 L0.00,0.00 Z'></path>
			</svg>
		</div>
	);
});
