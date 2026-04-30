import { hsvaToString } from '@/helpers/colorConversion';
import { Alpha, HsvaColor } from '@uiw/react-color';
import { memo } from 'react';
import ColorSliderPointer from './ColorSliderPointer';

type AlphaSliderProps = {
	hsva: HsvaColor;
	onChange: (newAlpha: { a: number }) => void;
};

const AlphaSlider = memo(function AlphaSlider({
	hsva,
	onChange,
}: AlphaSliderProps) {
	return (
		<div className='h-48 rounded-1 border border-white outline outline-zinc-400 has-focus-visible:outline-3 has-focus-visible:outline-black over:outline-3 over:outline-black'>
			<Alpha
				hsva={hsva}
				onChange={onChange}
				direction='vertical'
				radius='4px'
				className='h-full! w-4'
				innerProps={{
					className:
						'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black group rounded-1',
				}}
				pointer={({ top }) => {
					return <ColorSliderPointer top={top} color={hsvaToString(hsva)} />;
				}}
			/>
		</div>
	);
});

export default AlphaSlider;
