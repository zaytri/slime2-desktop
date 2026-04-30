import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Input, Label } from '@headlessui/react';
import { memo } from 'react';

type NumberFieldProps = {
	label: string;
	value: number | null;
	onChange: (value: number | null) => void;
	placeholder?: string;
	description?: string;
	step?: number | 'any';
	min?: number;
	max?: number;
};

const NumberField = memo(function NumberField({
	label,
	placeholder,
	description,
	value,
	onChange,
	step,
	min,
	max,
}: NumberFieldProps) {
	return (
		<Field>
			<div className='input-wrapper flex-col'>
				<Label className='input-label'>{label}</Label>

				<Input
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
						const { value } = event.target;

						let newNumber = value
							? Number.isInteger(step)
								? Number.parseInt(value)
								: Number.parseFloat(value)
							: NaN;

						if (Number.isNaN(newNumber)) {
							onChange(null);
						} else {
							if (max !== undefined) newNumber = Math.min(newNumber, max);
							if (min !== undefined) newNumber = Math.max(newNumber, min);
							onChange(newNumber);
						}
					}}
					onWheel={event => {
						// prevents using mouse wheel to increment/decrement number
						// since mouse wheel also scrolls the entire settings container
						event.currentTarget.blur();
					}}
				/>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
});

export default NumberField;
