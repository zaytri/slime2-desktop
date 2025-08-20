import { memo } from 'react';

export default memo(function DownSvg({ className }: Props.WithClassName) {
	return (
		<div className={className}>
			<svg
				shapeRendering='geometricPrecision'
				textRendering='geometricPrecision'
				imageRendering='optimizeQuality'
				fillRule='evenodd'
				clipRule='evenodd'
				viewBox='0 0 486 512.039'
				fill='currentColor'
			>
				<path d='M314.455 273.58l19.809-256.514C334.986 7.718 326.575 0 317.202 0H168.798c-9.373 0-17.784 7.705-17.062 17.066l19.809 256.514h-.369L70.209 238.26c-51.215-19.781-91.88 12.189-57.444 49.591l191.653 199.997c32.257 32.254 45.762 32.254 78.016 0l191.652-199.997c32.434-36.276-6.228-69.372-57.441-49.591l-100.969 35.32h-1.221z' />
			</svg>
		</div>
	);
});
