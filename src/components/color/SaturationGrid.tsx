import { hsvaToString } from '@/helpers/colorConversion';
import { HsvaColor, Saturation, SaturationProps } from '@uiw/react-color';
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
		<div className='size-48 rounded-1 border border-white outline outline-zinc-400 has-focus-visible:outline-3 has-focus-visible:outline-black over:outline-3 over:outline-black'>
			<Saturation
				hsva={hsva}
				onChange={onChange}
				radius='4px'
				className='group size-full! over:outline-black'
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
		</div>
	);
}
