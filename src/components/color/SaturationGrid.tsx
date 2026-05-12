import { hsvaToString } from '@/helpers/colorConversion';
import {
	type HsvaColor,
	Saturation,
	type SaturationProps,
} from '@uiw/react-color';
import ColorGridPointer from './ColorGridPointer';

type SaturationGridProps = {
	hsva: HsvaColor;
	onChange: NonNullable<SaturationProps['onChange']>;
};

export default function SaturationGrid({
	onChange,
	hsva,
}: SaturationGridProps) {
	return (
		<div className='relative size-48 rounded-1 outline-2 outline-white has-focus-visible:outline-4 over:outline-4'>
			<Saturation
				hsva={hsva}
				onChange={onChange}
				radius={3}
				className='group size-full!'
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
			<div className='pointer-events-none absolute inset-0 rounded-1 outline -outline-offset-1 outline-black/25'></div>
		</div>
	);
}
