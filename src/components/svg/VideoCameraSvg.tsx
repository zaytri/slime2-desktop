import { memo } from 'react';
import SvgWrapper from './SvgWrapper';

const VideoCameraSvg = memo(function VideoCameraSvg({
	className,
}: Props.WithClassName) {
	return (
		<SvgWrapper className={className}>
			<svg viewBox='0 0 112.16 122.88' fillRule='evenodd' fill='currentColor'>
				<path d='M14.76,47.89H71.34a9.56,9.56,0,0,1,9.54,9.53V93a9.58,9.58,0,0,1-9.54,9.54H53.86l12.7,20.37H54.73L40.89,104.27l-14,18.61h-12l12.62-20.37H14.76A9.57,9.57,0,0,1,5.22,93V57.42a9.56,9.56,0,0,1,9.54-9.53Zm.24-38a15,15,0,1,1-15,15,15,15,0,0,1,15-15ZM61.06,0A19.89,19.89,0,1,1,41.17,19.89,19.88,19.88,0,0,1,61.06,0ZM86.3,91V60.38l25.86-15.24v61.51L86.3,91Z' />
			</svg>
		</SvgWrapper>
	);
});

export default VideoCameraSvg;
