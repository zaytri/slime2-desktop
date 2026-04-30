import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Label, Textarea } from '@headlessui/react';
import clsx from 'clsx';
import { memo } from 'react';

type TextAreaFieldProps = {
	label: string;
	value: string;
	onChange: (text: string) => void;
	placeholder?: string;
	description?: string;
	rows?: number;
	inputClassName?: string;
	spellCheck?: boolean;
};

const TextAreaField = memo(function TextAreaField({
	label,
	placeholder,
	description,
	value,
	onChange,
	rows,
	inputClassName,
	spellCheck,
}: TextAreaFieldProps) {
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
});

export default TextAreaField;
