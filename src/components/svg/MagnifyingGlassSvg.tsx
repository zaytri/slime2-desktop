import { memo } from 'react';
import SvgWrapper from './SvgWrapper';

const MagnifyingGlassSvg = memo(function MagnifyingGlassSvg({
	className,
}: Props.WithClassName) {
	return (
		<SvgWrapper className={className}>
			<svg viewBox='0 0 122.88 122.88' fillRule='evenodd' fill='currentColor'>
				<path d='M42.31,0A42.31,42.31,0,0,1,77.52,65.75l8.56,8.56.09-.09a5.38,5.38,0,0,1,7.59,0l27.55,27.55a5.39,5.39,0,0,1,0,7.59l-12,12a5.39,5.39,0,0,1-7.59,0L74.22,93.76a5.38,5.38,0,0,1,0-7.59l.09-.09-8.56-8.56A42.31,42.31,0,1,1,42.31,0Zm0,9.5A32.81,32.81,0,1,1,9.5,42.31,32.81,32.81,0,0,1,42.31,9.5Z' />
			</svg>
		</SvgWrapper>
	);
});

export default MagnifyingGlassSvg;
