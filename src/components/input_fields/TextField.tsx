import InputDescription from '@/components/input_fields/InputDescription';
import { Field, Input, Label } from '@headlessui/react';
import clsx from 'clsx';

type TextFieldProps = {
	label?: string;
	value: string;
	onChange: (text: string) => void;
	placeholder?: string;
	description?: string;
	autoFocus?: boolean;
	onEnterKey?: VoidFunction;
	compact?: boolean;
	inputClassName?: string;
};

export default function TextField({
	label,
	placeholder,
	description,
	value,
	onChange,
	autoFocus = false,
	onEnterKey,
	compact = false,
	inputClassName,
}: TextFieldProps) {
	function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		// only run this on this focused element
		if (document.activeElement !== event.currentTarget) return;

		if (onEnterKey && event.key === 'Enter') {
			onEnterKey();
		}
	}

	if (compact) {
		return (
			<Field className='flex items-center overflow-hidden rounded-1 bg-zinc-700 outline outline-zinc-800 has-data-focus:bg-green-800 has-data-focus:outline-3 has-data-focus:outline-lime-600'>
				{label && (
					<Label className='px-2 text-3.5 font-bold whitespace-nowrap text-white'>
						{label}
					</Label>
				)}

				<Input
					value={value}
					onChange={event => {
						onChange(event.target.value);
					}}
					size={1}
					placeholder={placeholder}
					className={clsx(
						'min-w-0 flex-1 bg-white py-0.5 pr-1 pl-1.5 outline-none placeholder:text-zinc-400',
						inputClassName,
					)}
					autoCorrect='off'
					autoCapitalize='off'
					autoComplete='off'
					aria-autocomplete='none'
					spellCheck={false}
					onKeyDown={onKeyDown}
				/>
			</Field>
		);
	}

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
					className={clsx('input-class', inputClassName)}
					autoComplete='off'
					aria-autocomplete='none'
					autoFocus={autoFocus}
					onKeyDown={onKeyDown}
				/>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
