import { Field, Input, Label } from '@headlessui/react';

type RgbaInputProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
};

export default function RgbaInput({ label, value, onChange }: RgbaInputProps) {
	return (
		<Field className='input-wrapper flex flex-col bg-zinc-800 px-2 py-0 text-white outline-0 outline-white!'>
			<Label className='text-3 font-medium text-zinc-200 text-shadow-[0_1px_black]'>
				{label}
			</Label>

			<Input
				value={value}
				autoCorrect='off'
				autoCapitalize='off'
				autoComplete='off'
				aria-autocomplete='none'
				spellCheck={false}
				className='min-w-0 text-3.5 outline-0 text-shadow-[0_1px_black]'
				type='number'
				min={0}
				max={255}
				step={1}
				onChange={event => {
					const { value } = event.target;
					const newNumber = value ? Number.parseInt(value) : 0;
					if (!Number.isNaN(newNumber)) onChange(newNumber);
				}}
				onFocus={event => {
					event.currentTarget.select();
				}}
			/>
		</Field>
	);
}
