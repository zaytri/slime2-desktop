import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Input, Label } from '@headlessui/react';
import { useRef } from 'react';

type SliderFieldProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
	description?: string;
	step?: number | 'any';
	min?: number;
	max?: number;
	allowValueScroll?: boolean;
};

export default function SliderField({
	label,
	value,
	onChange,
	description,
	step = 1, // default step to 1
	min = 0, // default min to 0
	max = 100, // default max to 100
	allowValueScroll = false,
}: SliderFieldProps) {
	const numberInputRef = useRef<HTMLInputElement>(null);

	function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		// only run this on this focused element
		if (document.activeElement !== event.currentTarget) return;

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

	function onChangeNumberInput(
		event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
	) {
		if (!allowValueScroll && !('inputType' in event.nativeEvent)) {
			// prevents mouse wheel and arrow keys to change number
			// works since text input uses InputEvent and those just use Event,
			// and inputType only exists on InputEvent
			return;
		}

		onChangeInput(event);
	}

	function onChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
		const newNumber = event.target.valueAsNumber;
		onChange(
			Number.isNaN(newNumber) ? min : Math.max(Math.min(newNumber, max), min),
		);
	}

	return (
		<Field>
			<div className='input-wrapper flex-col'>
				<Label className='input-label'>{label}</Label>

				<div className='flex items-center gap-2 py-1'>
					<input
						ref={numberInputRef}
						autoComplete='off'
						aria-autocomplete='none'
						type='number'
						value={value}
						min={min}
						max={max}
						step={step}
						className='w-16 rounded-1 bg-zinc-700 text-center font-semibold text-white outline outline-black text-shadow-[0_1px_#0006] over:bg-white over:text-black over:outline-3! over:outline-lime-600 over:text-shadow-none'
						onChange={onChangeNumberInput}
						onKeyDown={onKeyDown}
					/>

					<Input
						autoComplete='off'
						aria-autocomplete='none'
						type='range'
						value={value}
						min={min}
						max={max}
						step={step}
						className='mx-2 flex-1 cursor-pointer rounded-0.5 outline-offset-3 outline-lime-700'
						onChange={onChangeInput}
					/>
				</div>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
