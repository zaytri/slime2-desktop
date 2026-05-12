import { hsvaToString } from '@/helpers/colorConversion';
import { Hue, type HueProps } from '@uiw/react-color';
import ColorSliderPointer from './ColorSliderPointer';

type HueSliderProps = {
	hue: number;
	onChange: NonNullable<HueProps['onChange']>;
};

export default function HueSlider({ hue, onChange }: HueSliderProps) {
	return (
		<div className='relative h-48 cursor-ns-resize rounded-1 outline-2 outline-white has-focus-visible:outline-4 over:outline-4'>
			<Hue
				hue={hue}
				onChange={onChange}
				direction='vertical'
				radius={3}
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
			<div className='pointer-events-none absolute inset-0 rounded-1 outline -outline-offset-1 outline-black/25'></div>
		</div>
	);
}
