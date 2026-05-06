import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Label, Textarea } from '@headlessui/react';
import clsx from 'clsx';

type TextAreaFieldProps = {
	label: string;
	value: string;
	onChange: (text: string) => void;
	placeholder?: string;
	description?: string;
	rows?: number;
	inputClassName?: string;
	spellCheck?: boolean;
	compact?: boolean;
};

export default function TextAreaField({
	label,
	placeholder,
	description,
	value,
	onChange,
	rows,
	inputClassName,
	spellCheck,
	compact = false,
}: TextAreaFieldProps) {
	if (compact) {
		return (
			<Field className='flex flex-col overflow-hidden rounded-1 bg-zinc-700 outline outline-zinc-800 has-data-focus:bg-green-800 has-data-focus:outline-3 has-data-focus:outline-lime-600'>
				{label && (
					<Label className='px-2 py-0.5 text-3.5 font-bold whitespace-nowrap text-white'>
						{label}
					</Label>
				)}

				<Textarea
					value={value}
					onChange={event => {
						onChange(event.target.value);
					}}
					rows={rows || 3}
					placeholder={placeholder}
					className='min-w-0 flex-1 bg-white px-2 py-0.5 outline-none placeholder:text-zinc-400'
					autoComplete='off'
					aria-autocomplete='none'
				/>
			</Field>
		);
	}

	return (
		<Field>
			<div className='input-wrapper flex-col'>
				<Label className='input-label'>{label}</Label>

				<Textarea
					value={value}
					onChange={event => {
						onChange(event.target.value);
					}}
					placeholder={placeholder}
					className={clsx('input-class', inputClassName)}
					autoComplete='off'
					aria-autocomplete='none'
					rows={rows || 4}
					spellCheck={spellCheck}
				/>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
