import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Input, Label } from '@headlessui/react';
import { useRef } from 'react';

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
	allowValueScroll?: boolean;
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
	allowValueScroll = false,
}: NumberFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		// only run this on this focused element
		if (document.activeElement !== event.currentTarget) return;

		if (onEnterKey && event.key === 'Enter') {
			onEnterKey();
		}

		if (!allowValueScroll) {
			// add back functionality to allow arrow keys to change number
			const stepValue = typeof step === 'number' && step > 0 ? step : 1;
			const startValue = value ?? 0;

			if (event.key === 'ArrowUp') {
				const newValue = startValue + stepValue;
				onChange(typeof max === 'number' ? Math.min(max, newValue) : newValue);
			} else if (event.key === 'ArrowDown') {
				const newValue = startValue - stepValue;
				onChange(typeof min === 'number' ? Math.max(min, newValue) : newValue);
			}
		}
	}

	function onChangeNumber(
		event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
	) {
		if (!allowValueScroll && !('inputType' in event.nativeEvent)) {
			// prevents mouse wheel and arrow keys to change number
			// works since text input uses InputEvent and those just use Event,
			// and inputType only exists on InputEvent
			return;
		}

		const newNumber = event.target.valueAsNumber;
		onChange(Number.isNaN(newNumber) ? null : newNumber);
	}

	if (compact) {
		return (
			<Field className='flex items-center overflow-hidden rounded-1 bg-zinc-700 outline -outline-offset-1 outline-zinc-800 has-data-focus:bg-green-800 has-data-focus:outline-3 has-data-focus:outline-lime-600'>
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
					onChange={onChangeNumber}
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
					onChange={onChangeNumber}
					onKeyDown={onKeyDown}
				/>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
