import { memo } from 'react';

const TriangleDownSvg = memo(function TriangleDownSvg({
	className,
}: Props.WithClassName) {
	return (
		<div className={className}>
			<svg
				shapeRendering='geometricPrecision'
				textRendering='geometricPrecision'
				imageRendering='optimizeQuality'
				fillRule='evenodd'
				clipRule='evenodd'
				viewBox='0 0 512 336.36'
				fill='currentColor'
			>
				<path
					fillRule='nonzero'
					d='M42.47.01 469.5 0C492.96 0 512 19.04 512 42.5c0 11.07-4.23 21.15-11.17 28.72L294.18 320.97c-14.93 18.06-41.7 20.58-59.76 5.65-1.8-1.49-3.46-3.12-4.97-4.83L10.43 70.39C-4.97 52.71-3.1 25.86 14.58 10.47 22.63 3.46 32.57.02 42.47.01z'
				/>
			</svg>
		</div>
	);
});

export default TriangleDownSvg;
