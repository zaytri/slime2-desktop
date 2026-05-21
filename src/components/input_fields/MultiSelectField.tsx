import InputDescription from '@/components/input_fields/InputDescription';
import CheckSvg from '@@/svg/CheckSvg';
import { Checkbox, Field, Fieldset, Label, Legend } from '@headlessui/react';
import { useId } from 'react';

type MultiSelectFieldProps<V> = {
	values: V[];
	onChange: (values: V[]) => void;
	label: string;
	description?: string;
	options: { label: string; value: V }[];
	compact?: boolean;
};

export default function MultiSelectField<V>({
	values,
	onChange,
	label,
	description,
	options,
	compact = false,
}: MultiSelectFieldProps<V>) {
	const descriptionId = useId();

	function onCheckOption(newCheckedValue: boolean, optionValue: V) {
		if (newCheckedValue) {
			// true, was unchecked now is checked
			// add to values array
			onChange([...values, optionValue]);
		} else {
			// false, was checked now is unchecked
			// remove from values array
			onChange(
				values.filter(value => {
					return value !== optionValue;
				}),
			);
		}
	}

	if (compact) {
		return (
			<Fieldset className='flex items-center overflow-hidden rounded-1 bg-zinc-700 outline -outline-offset-1 outline-zinc-800 has-data-focus:bg-green-800 has-data-focus:outline-3 has-data-focus:outline-lime-600'>
				<Legend className='self-start px-2 pt-1.25 pb-1 text-3.5 font-bold whitespace-nowrap text-white'>
					{label}
				</Legend>

				<div className='flex flex-1 flex-wrap gap-2 self-stretch bg-white px-2 py-1'>
					{options.map(option => {
						return (
							<Field key={option.label}>
								<Checkbox
									className='group/check flex flex-1 items-center rounded-1 px-1 py-0.5 outline-lime-600 data-over:bg-lime-200 data-over:outline-2'
									checked={values.includes(option.value)}
									onKeyDown={onKeyDown}
									onChange={newCheckedValue => {
										onCheckOption(newCheckedValue, option.value);
									}}
								>
									<Label className='flex cursor-pointer items-center gap-1 text-3.5 font-semibold select-none'>
										<div className='flex items-center justify-center rounded-1 border-2 border-zinc-700 bg-white p-0.5 group-data-checked/check:bg-zinc-700!'>
											<CheckSvg className='size-3 text-transparent group-data-checked/check:text-white' />
										</div>
										<p className='-mb-px'>{option.label}</p>
									</Label>
								</Checkbox>
							</Field>
						);
					})}
				</div>
			</Fieldset>
		);
	}

	return (
		<Fieldset aria-describedby={descriptionId}>
			<div className='input-wrapper flex-col input-wrapper-focus-visible'>
				<Legend className='input-label'>{label}</Legend>

				<div className='flex flex-wrap gap-1.5 py-1'>
					{options.map(option => {
						return (
							<Field key={option.label}>
								<Checkbox
									className='group/select input-select-option'
									checked={values.includes(option.value)}
									onKeyDown={onKeyDown}
									onChange={newCheckedValue => {
										onCheckOption(newCheckedValue, option.value);
									}}
								>
									<Label className='flex cursor-pointer items-center gap-2 select-none'>
										<CheckSvg className='-mb-0.5 hidden size-3 group-data-checked/select:block' />
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
