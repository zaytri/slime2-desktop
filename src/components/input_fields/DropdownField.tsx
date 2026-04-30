import InputDescription from '@/components/input_fields/InputDescription';
import TriangleDownSvg from '@/components/svg/TriangleDownSvg';
import {
	Field,
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react';
import clsx from 'clsx';

type DropdownFieldProps<V> = {
	value: V;
	onChange: (value: V) => void;
	label: string;
	description?: string;
	placeholder?: string;
	options: {
		label: string;
		value: V;
	}[];
};

export default function DropdownField<V>({
	value,
	onChange,
	label,
	description,
	placeholder,
	options,
}: DropdownFieldProps<V>) {
	const optionMap = new Map(options.map(({ label, value }) => [value, label]));

	return (
		<Field className='relative'>
			<Listbox value={value} onChange={onChange}>
				<ListboxButton className='group/dropdown input-wrapper flex cursor-pointer items-center input-wrapper-over input-wrapper-has-hover'>
					<div className='flex flex-1 flex-col'>
						<Label className='cursor-pointer input-label'>{label}</Label>
						<p className={clsx(value ? 'text-black' : 'text-zinc-400')}>
							{value === undefined ? placeholder : optionMap.get(value)}
						</p>
					</div>

					<div className='flex size-5 items-center justify-center rounded-1 group-data-over/dropdown:bg-lime-600 group-data-over/dropdown:text-white group-data-over/dropdown:outline-2'>
						<TriangleDownSvg className='size-3 pt-0.5' />
					</div>
				</ListboxButton>

				<ListboxOptions
					anchor={{ to: 'bottom', gap: 0, padding: 48 }}
					className='z-10 flex w-(--button-width) flex-col rounded-2 bg-white outline-4 -outline-offset-2 outline-lime-600'
				>
					{options.map(option => {
						return (
							<ListboxOption
								key={option.label}
								value={option.value}
								className='px-3 py-1.5 data-focus:bg-lime-200 data-focus:outline data-focus:outline-lime-600'
							>
								{option.label}
							</ListboxOption>
						);
					})}
				</ListboxOptions>
			</Listbox>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
