import { HsvaColor, Saturation, SaturationProps } from '@uiw/react-color';
import { memo, useEffect, useState } from 'react';
import ColorGridPointer from './ColorGridPointer';
import { hsvaToString } from './colorConversion';

type SaturationGridProps = {
	hsva: HsvaColor;
	onChange: NonNullable<SaturationProps['onChange']>;
};

const SaturationGrid = memo(function SaturationGrid({
	onChange,
	hsva,
}: SaturationGridProps) {
	const [arrowsPressed, setArrowsPressed] = useState<Record<string, boolean>>(
		{},
	);

	// allows using arrow keys to change the color
	// shift multiplies the color change by 5
	useEffect(() => {
		let sModifier = 0;
		let vModifier = 0;

		if (arrowsPressed['ArrowLeft']) sModifier -= 1;
		if (arrowsPressed['ArrowRight']) sModifier += 1;
		if (arrowsPressed['ArrowUp']) vModifier += 1;
		if (arrowsPressed['ArrowDown']) vModifier -= 1;
		if (arrowsPressed['Shift']) {
			sModifier *= 5;
			vModifier *= 5;
		}

		if (sModifier || vModifier) {
			onChange({
				...hsva,
				s: Math.min(Math.max(hsva.s + sModifier, 0), 100),
				v: Math.min(Math.max(hsva.v + vModifier, 0), 100),
			});
		}
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
		<Saturation
			hsva={hsva}
			onChange={onChange}
			style={{ width: '100%' }}
			radius='4px'
			className='group border border-white outline outline-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
			onKeyDown={event => {
				onKeyChange(event, true);
			}}
			onKeyUp={event => {
				onKeyChange(event, false);
			}}
			onBlur={() => {
				setArrowsPressed({});
			}}
			pointer={({ left, top }) => {
				return (
					<ColorGridPointer
						left={left}
						top={top}
						color={hsvaToString({ ...hsva, a: 1 })}
					/>
				);
			}}
		/>
	);
});

export default SaturationGrid;
