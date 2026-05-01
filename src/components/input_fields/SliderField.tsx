import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Input, Label } from '@headlessui/react';

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

				<div className='flex items-center gap-2'>
					<Input
						autoComplete='off'
						aria-autocomplete='none'
						type='range'
						value={value}
						min={min}
						max={max}
						step={step}
						className='my-1.5 flex-1 cursor-pointer rounded-full outline-none'
						onChange={onChangeInput}
					/>

					<Input
						autoComplete='off'
						aria-autocomplete='none'
						type='number'
						value={value}
						min={min}
						max={max}
						step={step}
						className='w-16 rounded-1 bg-zinc-700 text-center font-semibold text-white outline outline-black text-shadow-[0_1px_#0006] over:bg-lime-200 over:text-lime-800 over:outline-2! over:outline-lime-600 over:text-shadow-none'
						onChange={onChangeInput}
						onWheel={event => {
							// prevents using mouse wheel to increment/decrement number
							// since mouse wheel also scrolls the entire settings container
							event.currentTarget.blur();
						}}
					/>
				</div>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
