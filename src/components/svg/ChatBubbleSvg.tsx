import { memo } from 'react';
import SvgWrapper from './SvgWrapper';

const ChatBubbleSvg = memo(function ChatBubbleSvg({
	className,
}: Props.WithClassName) {
	return (
		<SvgWrapper className={className}>
			<svg fill='currentColor' viewBox='0 0 121.83 122.88'>
				<path
					fillRule='evenodd'
					d='M55.05,97.68l-24.9,23.88a3.95,3.95,0,0,1-6.89-2.62V97.68H10.1A10.16,10.16,0,0,1,0,87.58V10.1A10.18,10.18,0,0,1,10.1,0H111.73a10.16,10.16,0,0,1,10.1,10.1V87.58a10.16,10.16,0,0,1-10.1,10.1ZM27.53,36.61a3.94,3.94,0,0,1,0-7.87H94.3a3.94,3.94,0,1,1,0,7.87Zm0,25.55a3.94,3.94,0,0,1,0-7.87H82a3.94,3.94,0,0,1,0,7.87Z'
				/>
			</svg>
		</SvgWrapper>
	);
});

export default ChatBubbleSvg;
