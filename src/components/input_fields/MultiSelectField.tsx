import InputDescription from '@/components/input_fields/InputDescription';
import { Checkbox, Field, Fieldset, Label, Legend } from '@headlessui/react';
import { useId } from 'react';

type MultiSelectFieldProps = {
	values: (string | number | boolean)[];
	onChange: (values: (string | number | boolean)[]) => void;
	label: string;
	description?: string;
	options: { label: string; value: string | number | boolean }[];
};

export default function MultiSelectField({
	values,
	onChange,
	label,
	description,
	options,
}: MultiSelectFieldProps) {
	const descriptionId = useId();

	return (
		<Fieldset aria-describedby={descriptionId}>
			<div className='input-wrapper flex-col input-wrapper-focus-visible'>
				<Legend className='input-label'>{label}</Legend>

				<div className='flex flex-wrap gap-1.5 py-1'>
					{options.map(option => {
						return (
							<Field key={option.label}>
								<Checkbox
									className='input-select-option'
									checked={values.includes(option.value)}
									onKeyDown={onKeyDown}
									onChange={newCheckedValue => {
										if (newCheckedValue) {
											// true, was unchecked now is checked
											// add to values array
											onChange([...values, option.value]);
										} else {
											// false, was checked now is unchecked
											// remove from values array
											onChange(
												values.filter(value => {
													return value !== option.value;
												}),
											);
										}
									}}
								>
									<Label className='cursor-pointer select-none'>
										{option.label}
									</Label>
								</Checkbox>
							</Field>
						);
					})}
				</div>
			</div>

			<InputDescription id={descriptionId}>{description}</InputDescription>
		</Fieldset>
	);
}

// allows using arrow keys to navigate through the options
// just like the radio group in SelectInput
function onKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
	// only run this on this focused element
	if (document.activeElement !== event.currentTarget) return;

	const parentField = event.currentTarget.parentElement;

	const fieldToFocus =
		event.key === 'ArrowRight' || event.key === 'ArrowDown'
			? // get the next field
				// or the first field if this is the last field
				(parentField?.nextElementSibling ??
				parentField?.parentElement?.firstElementChild)
			: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
				? // get the previous field
					// or the last field if this is the first field
					(parentField?.previousElementSibling ??
					parentField?.parentElement?.lastElementChild)
				: null;

	const checkboxToFocus = fieldToFocus?.firstElementChild;

	if (checkboxToFocus) {
		event.preventDefault();
		(checkboxToFocus as HTMLElement).focus();
	}
}
