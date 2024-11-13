import { memo } from 'react';

export default memo(function RightSvg({ className }: Props.WithClassName) {
	return (
		<div className={className}>
			<svg
				shapeRendering='geometricPrecision'
				textRendering='geometricPrecision'
				imageRendering='optimizeQuality'
				fillRule='evenodd'
				clipRule='evenodd'
				viewBox='0 0 512 485.963'
				fill='currentColor'
			>
				<path d='M273.559 171.532L17.064 151.724C7.717 151.002 0 159.413 0 168.785v148.393c0 9.372 7.704 17.783 17.064 17.06l256.495-19.807v.369l-35.318 100.959c-19.779 51.211 12.189 91.873 49.588 57.439l199.982-191.637c32.252-32.255 32.252-45.759 0-78.011L287.829 11.913c-36.273-32.432-69.367 6.228-49.588 57.436l35.318 100.962v1.221z' />
			</svg>
		</div>
	);
});
