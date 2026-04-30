import InputDescription from '@/components/input_fields/InputDescription';
import {
	Field,
	Fieldset,
	Label,
	Legend,
	Radio,
	RadioGroup,
} from '@headlessui/react';
import { useId } from 'react';

type SelectFieldProps<V> = {
	value: V;
	onChange: (value: V) => void;
	label: string;
	description?: string;
	options: {
		label: string;
		value: V;
	}[];
};

export default function SelectField<V>({
	value,
	onChange,
	label,
	description,
	options,
}: SelectFieldProps<V>) {
	const descriptionId = useId();

	return (
		<Fieldset aria-describedby={descriptionId}>
			<div className='input-wrapper flex-col input-wrapper-focus-visible'>
				<Legend className='input-label'>{label}</Legend>

				<RadioGroup
					value={value}
					onChange={onChange}
					className='flex flex-wrap gap-1.5 py-1'
				>
					{options.map(option => {
						return (
							<Field key={option.label}>
								<Radio value={option.value} className='input-select-option'>
									<Label className='cursor-pointer select-none'>
										{option.label}
									</Label>
								</Radio>
							</Field>
						);
					})}
				</RadioGroup>
			</div>

			<InputDescription id={descriptionId}>{description}</InputDescription>
		</Fieldset>
	);
}
