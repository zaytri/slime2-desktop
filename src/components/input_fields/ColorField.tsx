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
import { type HsvaColor, hsvaToRgba, rgbaToHsva } from '@uiw/react-color';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import ColorPreview from '../color/ColorPreview';

type ColorFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	description?: string;
	compact?: boolean;
};

export default function ColorField({
	label,
	value,
	onChange,
	placeholder,
	description,
	compact = false,
}: ColorFieldProps) {
	const context = usePopoverContext();
	const popoverStore = usePopoverStore({ store: context });
	const inputRef = useRef<HTMLInputElement>(null);
	const [hsvaValue, setHsvaValue] = useState<HsvaColor>(stringToHsva(value));
	const hasValidColor = CSS.supports('color', value);

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

	if (compact) {
		return (
			<Field>
				<PopoverProvider
					store={popoverStore}
					placement='top-start'
					setOpen={setPopoverOpen}
				>
					<div
						className={clsx(
							'group/color flex items-center overflow-hidden rounded-1 bg-zinc-700 outline -outline-offset-1 outline-zinc-800 over:bg-green-800 over:outline-3 over:outline-lime-600',
							popoverOpen && 'bg-green-800 outline-3 outline-lime-600',
						)}
						onClick={() => {
							inputRef.current?.focus();
						}}
					>
						{label && (
							<Label className='cursor-pointer px-2 text-3.5 font-bold whitespace-nowrap text-white'>
								{label}
							</Label>
						)}

						<div className='flex flex-1 items-center gap-1.5 bg-white pl-1.5'>
							{/* color preview box */}
							<PopoverAnchor className='cursor-pointer'>
								<ColorPreview color={value} className='size-5' />
							</PopoverAnchor>

							<Input
								size={1}
								value={value}
								onChange={event => {
									onStringChange(event.target.value);
								}}
								placeholder={placeholder || 'Select color...'}
								className='min-w-0 flex-1 py-0.5 pr-1 outline-none placeholder:text-zinc-400'
								autoCorrect='off'
								autoCapitalize='off'
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

					<ColorPopover
						hsva={hsvaValue}
						onHsvaChange={onHsvaChange}
						hasValidColor={hasValidColor}
					/>
				</PopoverProvider>
			</Field>
		);
	}

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
						<Label className='cursor-pointer input-label'>{label}</Label>

						<Input
							value={value}
							onChange={event => {
								onStringChange(event.target.value);
							}}
							placeholder={placeholder || 'Select color...'}
							className='input-class'
							autoComplete='off'
							aria-autocomplete='none'
							autoCorrect='off'
							autoCapitalize='off'
							ref={inputRef}
							onFocusCapture={event => {
								popoverStore.setDisclosureElement(event.currentTarget);
								popoverStore.show();
							}}
						/>
					</div>
				</div>

				<ColorPopover
					hsva={hsvaValue}
					onHsvaChange={onHsvaChange}
					hasValidColor={hasValidColor}
				/>
			</PopoverProvider>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}

type ColorPopoverProps = {
	hsva: HsvaColor;
	onHsvaChange: (hsva: HsvaColor) => void;
	hasValidColor: boolean;
};

function ColorPopover({
	hsva,
	onHsvaChange,
	hasValidColor, // hide alpha values on invalid color
}: ColorPopoverProps) {
	return (
		<Popover
			autoFocusOnShow={false}
			gutter={8}
			fitViewport
			className='dark-menu flex flex-row! gap-6 p-5!'
		>
			<SaturationGrid
				hsva={hsva}
				onChange={newColor => {
					const newHsva = { ...hsva, ...newColor, a: hsva.a };
					onHsvaChange(newHsva);
				}}
			/>

			<HueSlider
				hue={hsva.h}
				onChange={newHue => {
					const newHsva = { ...hsva, ...newHue };
					onHsvaChange(newHsva);
				}}
			/>

			{hasValidColor && (
				<AlphaSlider
					hsva={hsva}
					onChange={newAlpha => {
						const newHsva = { ...hsva, ...newAlpha };
						onHsvaChange(newHsva);
					}}
				/>
			)}

			<div className='flex flex-col gap-1.75'>
				<RgbaInput
					label='Red'
					value={hsvaToRgba(hsva).r}
					onChange={newRed => {
						const rgbaValue = hsvaToRgba(hsva);
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
					value={hsvaToRgba(hsva).g}
					onChange={newGreen => {
						const rgbaValue = hsvaToRgba(hsva);
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
					value={hsvaToRgba(hsva).b}
					onChange={newBlue => {
						const rgbaValue = hsvaToRgba(hsva);
						onHsvaChange(
							rgbaToHsva({
								...rgbaValue,
								b: Math.min(Math.max(newBlue, 0), 255),
							}),
						);
					}}
				/>

				{hasValidColor && (
					<RgbaInput
						label='Alpha'
						value={Math.round(hsva.a * 255)}
						onChange={newAlpha => {
							onHsvaChange({
								...hsva,
								a: Math.min(Math.max(newAlpha, 0), 255) / 255,
							});
						}}
					/>
				)}
			</div>
		</Popover>
	);
}
