import { memo } from 'react';

export default memo(function LeftSvg({ className }: Props.WithClassName) {
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
				<path d='M238.441 171.532l256.495-19.808c9.347-.722 17.064 7.689 17.064 17.061v148.393c0 9.373-7.704 17.783-17.064 17.061l-256.495-19.808v.369l35.318 100.96c19.779 51.211-12.189 91.873-49.588 57.439L24.189 281.561c-32.252-32.255-32.252-45.759 0-78.011L224.171 11.913c36.273-32.432 69.367 6.228 49.588 57.436l-35.318 100.963v1.22z' />
			</svg>
		</div>
	);
});
