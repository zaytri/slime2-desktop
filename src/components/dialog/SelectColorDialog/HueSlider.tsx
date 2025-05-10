import { Hue, HueProps } from '@uiw/react-color';
import { memo, useEffect, useState } from 'react';
import ColorSliderPointer from './ColorSliderPointer';
import { hsvaToString } from './colorConversion';

type HueSliderProps = {
	hue: number;
	onChange: NonNullable<HueProps['onChange']>;
};

const HueSlider = memo(function HueSlider({ hue, onChange }: HueSliderProps) {
	const [arrowsPressed, setArrowsPressed] = useState<Record<string, boolean>>(
		{},
	);

	// allows using arrow keys to change the color
	// shift multiplies the color change by 10
	useEffect(() => {
		let modifier = 0;

		if (arrowsPressed['ArrowRight'] || arrowsPressed['ArrowUp']) {
			modifier += 1;
		}
		if (arrowsPressed['ArrowLeft'] || arrowsPressed['ArrowDown']) {
			modifier -= 1;
		}
		if (arrowsPressed['Shift']) modifier *= 10;

		onChange({ h: Math.min(Math.max(hue + modifier, 0), 360) });
	}, [arrowsPressed]);

	function onKeyChange(
		event: React.KeyboardEvent<HTMLDivElement>,
		isDown: boolean,
	) {
		// only run this on this focused element
		if (document.activeElement !== event.currentTarget) return;
		if (event.key.startsWith('Arrow') || event.key === 'Shift') {
			event.preventDefault();
			setArrowsPressed({
				...arrowsPressed,
				[event.key]: isDown,
			});
		}
	}

	return (
		<Hue
			hue={hue}
			onChange={onChange}
			radius='4px'
			className='border border-white outline outline-stone-400'
			innerProps={{
				className:
					'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black group rounded-1',
				onKeyDown: event => {
					onKeyChange(event, true);
				},
				onKeyUp: event => {
					onKeyChange(event, false);
				},
				onBlur: () => {
					setArrowsPressed({});
				},
			}}
			pointer={({ left }) => {
				return (
					<ColorSliderPointer
						left={left}
						color={hsvaToString({ h: hue, s: 100, v: 100, a: 1 })}
					/>
				);
			}}
		/>
	);
});

export default HueSlider;
