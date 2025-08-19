import { memo } from 'react';

const TwitchIconSvg = memo(function TwitchIconSvg({
	className,
}: Props.WithClassName) {
	return (
		<div className={className}>
			<svg viewBox='0 0 2400 2800' fill='currentColor'>
				<path
					d='M500,0L0,500v1800h600v500l500-500h400l900-900V0H500z M2200,1300l-400,400h-400l-350,350v-350H600V200h1600
			V1300z'
				/>
				<rect x='1700' y='550' width='200' height='600' />
				<rect x='1150' y='550' width='200' height='600' />
			</svg>
		</div>
	);
});

export default TwitchIconSvg;
