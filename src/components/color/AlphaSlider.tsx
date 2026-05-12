import { hsvaToString } from '@/helpers/colorConversion';
import { Alpha, type HsvaColor } from '@uiw/react-color';
import ColorSliderPointer from './ColorSliderPointer';

type AlphaSliderProps = {
	hsva: HsvaColor;
	onChange: (newAlpha: { a: number }) => void;
};

export default function AlphaSlider({ hsva, onChange }: AlphaSliderProps) {
	return (
		<div className='relative h-48 cursor-ns-resize rounded-1 outline-2 outline-white has-focus-visible:outline-4 over:outline-4'>
			<Alpha
				hsva={hsva}
				onChange={onChange}
				direction='vertical'
				radius={3}
				className='h-full! w-4'
				innerProps={{
					className:
						'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black group rounded-1',
				}}
				pointer={({ top }) => {
					return <ColorSliderPointer top={top} color={hsvaToString(hsva)} />;
				}}
			/>
			<div className='pointer-events-none absolute inset-0 rounded-1 outline -outline-offset-1 outline-black/25'></div>
		</div>
	);
}
