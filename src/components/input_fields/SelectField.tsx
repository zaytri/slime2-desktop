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
	label?: string;
	description?: string;
	options: {
		label: string;
		value: V;
	}[];
	compact?: boolean;
};

export default function SelectField<V>({
	value,
	onChange,
	label,
	description,
	options,
	compact = false,
}: SelectFieldProps<V>) {
	const descriptionId = useId();

	if (compact) {
		return (
			<Fieldset className='flex items-center overflow-hidden rounded-1 bg-zinc-700 outline outline-zinc-800 has-data-focus:bg-green-800 has-data-focus:outline-3 has-data-focus:outline-lime-600'>
				{label && (
					<Legend className='px-2 text-3.5 font-bold whitespace-nowrap text-white'>
						{label}
					</Legend>
				)}

				<RadioGroup
					value={value}
					onChange={onChange}
					className='flex flex-1 flex-wrap gap-2 self-stretch bg-white px-2 py-1'
				>
					{options.map(option => {
						return (
							<Field key={option.label}>
								<Radio
									value={option.value}
									className='group/check flex flex-1 items-center rounded-1 px-1 py-0.5 outline-lime-600 data-over:bg-lime-200 data-over:outline-2'
								>
									<Label className='flex cursor-pointer items-center gap-1 text-3.5 font-semibold select-none'>
										<div className='flex items-center justify-center rounded-full border-2 border-zinc-700 bg-white p-0.75 group-data-checked/check:bg-zinc-700!'>
											<div className='size-1.5 rounded-full bg-transparent group-data-checked/check:bg-white'></div>
										</div>
										<p className='-mb-0.5'>{option.label}</p>
									</Label>
								</Radio>
							</Field>
						);
					})}
				</RadioGroup>
			</Fieldset>
		);
	}

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
