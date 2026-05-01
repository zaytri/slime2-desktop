import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Input, Label } from '@headlessui/react';

type TextFieldProps = {
	label?: string;
	value: string;
	onChange: (text: string) => void;
	placeholder?: string;
	description?: string;
	autoFocus?: boolean;
	onEnterKey?: VoidFunction;
};

export default function TextField({
	label,
	placeholder,
	description,
	value,
	onChange,
	autoFocus = false,
	onEnterKey,
}: TextFieldProps) {
	return (
		<Field>
			<div className='input-wrapper flex-col'>
				{label && <Label className='input-label'>{label}</Label>}

				<Input
					value={value}
					onChange={event => {
						onChange(event.target.value);
					}}
					placeholder={placeholder}
					className='input-class'
					autoComplete='off'
					aria-autocomplete='none'
					autoFocus={autoFocus}
					onKeyDown={event => {
						// only run this on this focused element
						if (document.activeElement !== event.currentTarget) return;

						if (onEnterKey && event.key === 'Enter') {
							onEnterKey();
						}
					}}
				/>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
