import ColorInputPreview from '@/components/ColorInputPreview';
import DialogHeader from '@/components/dialog/DialogHeader';
import { useDialog } from '@/contexts/dialog/useDialog';
import { Field, Input, Label } from '@headlessui/react';
import { HsvaColor, hsvaToRgba, rgbaToHsva } from '@uiw/react-color';
import { memo, useState } from 'react';
import AlphaSlider from './AlphaSlider';
import { hsvaToString, stringToHsva } from './colorConversion';
import HueSlider from './HueSlider';
import RgbaInput from './RgbaInput';
import SaturationGrid from './SaturationGrid';

type SelectColorDialogProps = {
	value?: string;
	onSave: (color: string) => void;
};

const SelectColorDialog = memo(function SelectColorDialog({
	value,
	onSave,
}: SelectColorDialogProps) {
	const { closeDialog } = useDialog();
	const [stringValue, setStringValue] = useState(value);
	const [hsvaValue, setHsvaValue] = useState<HsvaColor>(
		stringToHsva(stringValue),
	);

	function onHsvaChange(hsvaColor: HsvaColor) {
		setHsvaValue(hsvaColor);
		const stringColor = hsvaToString(hsvaColor);
		setStringValue(stringColor);
	}

	function onStringChange(stringColor: string) {
		setHsvaValue(stringToHsva(stringColor));
		setStringValue(stringColor);
	}

	return (
		<div>
			<DialogHeader>Select Color</DialogHeader>

			<div className='flex flex-col items-stretch gap-4'>
				<SaturationGrid
					hsva={hsvaValue}
					onChange={newColor => {
						const newHsva = { ...hsvaValue, ...newColor, a: hsvaValue.a };
						onHsvaChange(newHsva);
					}}
				/>

				<HueSlider
					hue={hsvaValue.h}
					onChange={newHue => {
						const newHsva = { ...hsvaValue, ...newHue };
						onHsvaChange(newHsva);
					}}
				/>

				<AlphaSlider
					hsva={hsvaValue}
					onChange={newAlpha => {
						const newHsva = { ...hsvaValue, ...newAlpha };
						onHsvaChange(newHsva);
					}}
				/>

				<div className='input-wrapper justify-center divide-x divide-stone-300 p-0'>
					<RgbaInput
						label='Red'
						value={hsvaToRgba(hsvaValue).r}
						onChange={newRed => {
							const rgbaValue = hsvaToRgba(hsvaValue);
							onHsvaChange(
								rgbaToHsva({
									...rgbaValue,
									r: Math.min(Math.max(newRed, 0), 255),
								}),
							);
						}}
					/>

					<RgbaInput
						label='Green'
						value={hsvaToRgba(hsvaValue).g}
						onChange={newGreen => {
							const rgbaValue = hsvaToRgba(hsvaValue);
							onHsvaChange(
								rgbaToHsva({
									...rgbaValue,
									g: Math.min(Math.max(newGreen, 0), 255),
								}),
							);
						}}
					/>

					<RgbaInput
						label='Blue'
						value={hsvaToRgba(hsvaValue).b}
						onChange={newBlue => {
							const rgbaValue = hsvaToRgba(hsvaValue);
							onHsvaChange(
								rgbaToHsva({
									...rgbaValue,
									b: Math.min(Math.max(newBlue, 0), 255),
								}),
							);
						}}
					/>

					<RgbaInput
						label='Alpha'
						value={Math.round(hsvaValue.a * 255)}
						onChange={newAlpha => {
							onHsvaChange({
								...hsvaValue,
								a: Math.min(Math.max(newAlpha, 0), 255) / 255,
							});
						}}
					/>
				</div>

				<Field className='input-wrapper items-center'>
					<div className='flex flex-1 flex-col'>
						<Label className='input-label'>Color</Label>
						<Input
							value={stringValue ?? ''}
							placeholder='Select or type a color...'
							autoComplete='off'
							aria-autocomplete='none'
							className='input-class'
							onChange={event => {
								const newString = event.target.value.trim();
								onStringChange(newString);
							}}
						/>
					</div>
					<ColorInputPreview
						color={
							stringValue && CSS.supports('color', stringValue)
								? stringValue
								: 'transparent'
						}
					/>
				</Field>

				<button
					type='button'
					className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
					onClick={() => {
						if (stringValue && CSS.supports('color', stringValue)) {
							onSave(stringValue);
						}

						closeDialog();
					}}
				>
					Save
				</button>
			</div>
		</div>
	);
});

export default SelectColorDialog;
