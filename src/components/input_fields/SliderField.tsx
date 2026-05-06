import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Input, Label } from '@headlessui/react';
import { useEffect, useRef } from 'react';

type SliderFieldProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
	description?: string;
	step?: number | 'any';
	min?: number;
	max?: number;
};

export default function SliderField({
	label,
	value,
	onChange,
	description,
	step,
	min = 0, // default min to 0
	max = 100, // default max to 100
}: SliderFieldProps) {
	const numberInputRef = useRef<HTMLInputElement>(null);

	// prevents using mouse wheel to increment/decrement number
	// since mouse wheel also scrolls the entire container
	useEffect(() => {
		const inputElement = numberInputRef.current;
		if (!inputElement) return;

		function onWheel(event: WheelEvent) {
			event.preventDefault();
		}

		// passive: false is what makes this work
		inputElement.addEventListener('wheel', onWheel, { passive: false });

		return () => {
			inputElement.removeEventListener('wheel', onWheel);
		};
	}, [numberInputRef.current]);

	function onChangeInput(event: React.ChangeEvent<HTMLInputElement>) {
		const { value } = event.target;

		const newNumber = value
			? Number.isInteger(step)
				? Number.parseInt(value)
				: Number.parseFloat(value)
			: NaN;

		if (Number.isNaN(newNumber)) {
			onChange(min);
		} else {
			onChange(Math.max(Math.min(newNumber, max), min));
		}
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
						onChange={onChangeInput}
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
