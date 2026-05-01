import SvgWrapper from './SvgWrapper';

export default function ArrowUpSvg({ className }: Props.WithClassName) {
	return (
		<SvgWrapper className={className}>
			<svg
				shapeRendering='geometricPrecision'
				textRendering='geometricPrecision'
				imageRendering='optimizeQuality'
				fillRule='evenodd'
				clipRule='evenodd'
				viewBox='0 0 486 512.027'
				fill='currentColor'
			>
				<path d='M314.452 238.454l19.809 256.505c.722 9.348-7.689 17.065-17.062 17.065H168.801c-9.373 0-17.784-7.705-17.062-17.065l19.809-256.505h-.369L70.215 273.772c-51.213 19.781-91.877-12.189-57.442-49.589l191.646-199.99c32.256-32.253 45.761-32.253 78.014 0l191.645 199.99c32.433 36.274-6.228 69.37-57.439 49.589l-100.966-35.318h-1.221z' />
			</svg>
		</SvgWrapper>
	);
}
