import { memo } from 'react';

const TriangleRightSvg = memo(function TriangleRightSvg({
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
				viewBox='0 0 336 511.46'
				fill='currentColor'
			>
				<path
					fillRule='nonzero'
					d='M0 469V42.42c.02-9.89 3.46-19.81 10.45-27.85 15.39-17.66 42.2-19.53 59.86-4.15L321.46 229.2c1.69 1.51 3.32 3.17 4.81 4.97 14.92 18.04 12.4 44.78-5.64 59.7L71.14 500.3c-7.56 6.93-17.62 11.16-28.68 11.16C19.02 511.46 0 492.44 0 469z'
				/>
			</svg>
		</div>
	);
});

export default TriangleRightSvg;
