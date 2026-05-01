import { hsvaToString } from '@/helpers/colorConversion';
import { Hue, HueProps } from '@uiw/react-color';
import ColorSliderPointer from './ColorSliderPointer';

type HueSliderProps = {
	hue: number;
	onChange: NonNullable<HueProps['onChange']>;
};

export default function HueSlider({ hue, onChange }: HueSliderProps) {
	return (
		<div className='h-48 rounded-1 border border-white outline outline-zinc-400 has-focus-visible:outline-3 has-focus-visible:outline-black over:outline-3 over:outline-black'>
			<Hue
				hue={hue}
				onChange={onChange}
				direction='vertical'
				radius='4px'
				reverse
				className='h-full! w-4'
				innerProps={{
					className:
						'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black group rounded-1',
				}}
				pointer={({ top }) => {
					return (
						<ColorSliderPointer
							top={top}
							color={hsvaToString({ h: hue, s: 100, v: 100, a: 1 })}
						/>
					);
				}}
			/>
		</div>
	);
}
