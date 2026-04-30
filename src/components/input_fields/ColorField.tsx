import AlphaSlider from '@/components/color/AlphaSlider';
import HueSlider from '@/components/color/HueSlider';
import RgbaInput from '@/components/color/RgbaInput';
import SaturationGrid from '@/components/color/SaturationGrid';
import InputDescription from '@/components/input_fields/InputDescription';
import { hsvaToString, stringToHsva } from '@/helpers/colorConversion';
import {
	Popover,
	PopoverAnchor,
	PopoverProvider,
	usePopoverContext,
	usePopoverStore,
} from '@ariakit/react';
import { Field, Input, Label } from '@headlessui/react';
import { HsvaColor, hsvaToRgba, rgbaToHsva } from '@uiw/react-color';
import clsx from 'clsx';
import { memo, useRef, useState } from 'react';
import ColorPreview from '../color/ColorPreview';

type ColorFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	description?: string;
};

const ColorField = memo(function ColorField({
	label,
	value,
	onChange,
	placeholder,
	description,
}: ColorFieldProps) {
	const context = usePopoverContext();
	const popoverStore = usePopoverStore({ store: context });
	const inputRef = useRef<HTMLInputElement>(null);
	const [hsvaValue, setHsvaValue] = useState<HsvaColor>(stringToHsva(value));

	function onHsvaChange(hsvaColor: HsvaColor) {
		setHsvaValue(hsvaColor);
		const stringColor = hsvaToString(hsvaColor);
		onChange(stringColor);
	}

	function onStringChange(stringColor: string) {
		setHsvaValue(stringToHsva(stringColor));
		onChange(stringColor);
	}

	const [popoverOpen, setPopoverOpen] = useState(false);

	return (
		<Field>
			<PopoverProvider
				store={popoverStore}
				placement='top-start'
				setOpen={setPopoverOpen}
			>
				<div
					className={clsx(
						'group/color input-wrapper flex items-center gap-3 input-wrapper-over',
						popoverOpen && 'outline-4 -outline-offset-2! outline-lime-600',
					)}
					onClick={() => {
						inputRef.current?.focus();
					}}
				>
					{/* color preview box */}
					<PopoverAnchor className='cursor-pointer'>
						<ColorPreview color={value} className='my-1 size-8.5' />
					</PopoverAnchor>

					<div className='flex flex-1 flex-col'>
						<Label className='input-label'>{label}</Label>

						<Input
							value={value}
							onChange={event => {
								onStringChange(event.target.value);
							}}
							placeholder={placeholder || 'Select color...'}
							className='input-class'
							autoComplete='off'
							aria-autocomplete='none'
							ref={inputRef}
							onFocusCapture={event => {
								popoverStore.setDisclosureElement(event.currentTarget);
								popoverStore.show();
							}}
						/>
					</div>
				</div>

				<Popover
					autoFocusOnShow={false}
					className='z-50'
					gutter={8}
					wrapperProps={{ style: { left: 0 } }}
				>
					<div className='flex gap-4 rounded-2 bg-white p-4 outline-4 outline-lime-600'>
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

						<div className='flex flex-col justify-between'>
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
					</div>
				</Popover>
			</PopoverProvider>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
});

export default ColorField;
