import { Field, Input, Label } from '@headlessui/react';
import { memo } from 'react';

type RgbaInputProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
};

const RgbaInput = memo(function RgbaInput({
	label,
	value,
	onChange,
}: RgbaInputProps) {
	return (
		<Field className='flex w-22 flex-col bg-white px-2 py-0.5'>
			<Label className='text-3 font-medium'>{label}</Label>

			<Input
				value={value}
				autoComplete='off'
				aria-autocomplete='none'
				className='font-quicksand text-3.5 min-w-0 outline-0'
				type='number'
				min={0}
				max={255}
				step={1}
				onChange={event => {
					const { value } = event.target;
					const newNumber = value ? Number.parseInt(value) : 0;
					if (!Number.isNaN(newNumber)) onChange(newNumber);
				}}
			/>
		</Field>
	);
});

export default RgbaInput;
