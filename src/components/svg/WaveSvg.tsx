import SvgWrapper from './SvgWrapper';

export default function WaveSvg({ className }: Props.WithClassName) {
	return (
		<SvgWrapper className={className} useGpuRendering={false}>
			<svg viewBox='0 0 400 400' fill='currentColor'>
				<path d='M-43.73,256.09 C131.20,-133.69 225.45,508.72 500.84,37.02 L500.00,0.00 L0.00,0.00 Z'></path>
			</svg>
		</SvgWrapper>
	);
}
