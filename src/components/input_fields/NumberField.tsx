import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Input, Label } from '@headlessui/react';
import { useEffect, useRef } from 'react';

type NumberFieldProps = {
	label?: string;
	value: number | null;
	onChange: (value: number | null) => void;
	placeholder?: string;
	description?: string;
	step?: number | 'any';
	min?: number;
	max?: number;
	compact?: boolean;
	disabled?: boolean;
	onEnterKey?: VoidFunction;
};

export default function NumberField({
	label,
	placeholder,
	description,
	value,
	onChange,
	step,
	min,
	max,
	compact = false,
	disabled = false,
	onEnterKey,
}: NumberFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		// only run this on this focused element
		if (document.activeElement !== event.currentTarget) return;

		if (onEnterKey && event.key === 'Enter') {
			onEnterKey();
		}
	}

	// prevents using mouse wheel to increment/decrement number
	// since mouse wheel also scrolls the entire container
	useEffect(() => {
		const inputElement = inputRef.current;
		if (!inputElement) return;

		function onWheel(event: WheelEvent) {
			event.preventDefault();
		}

		// passive: false is what makes this work
		inputElement.addEventListener('wheel', onWheel, { passive: false });

		return () => {
			inputElement.removeEventListener('wheel', onWheel);
		};
	}, [inputRef.current]);

	function onChangeNumber(numberString: string) {
		let newNumber = numberString
			? Number.isInteger(step)
				? Number.parseInt(numberString)
				: Number.parseFloat(numberString)
			: NaN;

		if (Number.isNaN(newNumber)) {
			onChange(null);
		} else {
			if (max !== undefined) newNumber = Math.min(newNumber, max);
			if (min !== undefined) newNumber = Math.max(newNumber, min);
			onChange(newNumber);
		}
	}

	if (compact) {
		return (
			<Field className='flex items-center overflow-hidden rounded-1 bg-zinc-700 outline outline-zinc-800 has-data-focus:bg-green-800 has-data-focus:outline-3 has-data-focus:outline-lime-600'>
				{label && (
					<Label className='px-2 text-3.5 font-bold whitespace-nowrap text-white'>
						{label}
					</Label>
				)}

				<Input
					ref={inputRef}
					disabled={disabled}
					value={value === null ? '' : value}
					type='number'
					onChange={event => {
						onChangeNumber(event.target.value);
					}}
					size={1}
					placeholder={placeholder}
					className='min-w-0 flex-1 bg-white py-0.5 pr-1 pl-1.5 outline-none placeholder:text-zinc-400 disabled:bg-zinc-300'
					autoCorrect='off'
					autoCapitalize='off'
					autoComplete='off'
					aria-autocomplete='none'
					min={min}
					max={max}
					step={step || 1} // default step to 1
					onKeyDown={onKeyDown}
				/>
			</Field>
		);
	}

	return (
		<Field>
			<div className='input-wrapper flex-col'>
				<Label className='input-label'>{label}</Label>

				<Input
					ref={inputRef}
					disabled={disabled}
					value={value === null ? '' : value}
					type='number'
					autoComplete='off'
					aria-autocomplete='none'
					min={min}
					max={max}
					step={step || 1} // default step to 1
					placeholder={placeholder}
					className='input-class'
					onChange={event => {
						onChangeNumber(event.target.value);
					}}
					onKeyDown={onKeyDown}
				/>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
