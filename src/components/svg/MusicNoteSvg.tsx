import SvgWrapper from './SvgWrapper';

export default function MusicNotesSvg({ className }: Props.WithClassName) {
	return (
		<SvgWrapper className={className}>
			<svg fill='currentColor' viewBox='0 0 79.85 122.88'>
				<path
					fillRule='evenodd'
					clipRule='evenodd'
					d='M29.57,0h15.64v5.23c39.15,8.96,43.62,27.76,20.92,57.38c2.42-29.39-0.54-35.7-20.92-37.06v74.31 c0.04,0.39,0.05,0.78,0.05,1.19c0,9.66-10.13,19.24-22.63,21.4C10.14,124.6,0,118.52,0,108.86c0-13.18,18.1-24.61,29.57-20.58 L29.57,0L29.57,0z'
				/>
			</svg>
		</SvgWrapper>
	);
}
