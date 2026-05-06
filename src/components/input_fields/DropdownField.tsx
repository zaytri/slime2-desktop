import InputDescription from '@/components/input_fields/InputDescription';
import TriangleDownSvg from '@/components/svg/TriangleDownSvg';
import {
	Select,
	SelectItem,
	SelectLabel,
	SelectPopover,
	SelectProvider,
} from '@ariakit/react';
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
	compact?: boolean;
};

export default function DropdownField<V>({
	value,
	onChange,
	label,
	description,
	placeholder,
	options,
	compact = false,
}: DropdownFieldProps<V>) {
	const optionMap = new Map(options.map(({ label, value }) => [value, label]));

	if (compact) {
		return (
			<div className='flex'>
				<SelectProvider
					defaultValue={optionMap.get(value)}
					setValue={label => {
						const option = options.find(option => {
							return option.label === label;
						});
						if (option) {
							onChange(option.value);
						}
					}}
				>
					<div className='group/dropdown z-5 flex flex-1 items-center justify-between rounded-1 bg-zinc-700 outline outline-zinc-800 has-over:bg-green-800 has-over:outline-3 has-over:outline-offset-0! has-over:outline-lime-600'>
						<SelectLabel className='cursor-pointer px-2 py-0.5 text-3.5 font-bold whitespace-nowrap text-white'>
							{label}
						</SelectLabel>
						<Select className='flex flex-1 items-center gap-2 self-stretch bg-white px-2 outline-none'>
							<p
								className={clsx(
									'flex-1 text-left',
									value ? 'text-black' : 'text-zinc-400',
								)}
							>
								{value === undefined ? placeholder : optionMap.get(value)}
							</p>

							<div className='flex size-4 items-center justify-center rounded-0.5 group-over/dropdown:bg-lime-600 group-over/dropdown:text-white'>
								<TriangleDownSvg className='size-2.5' />
							</div>
						</Select>
					</div>
					<SelectPopover
						sameWidth
						fitViewport
						flip='bottom-end'
						className='z-10 flex max-h-(--popover-available-height) flex-col overflow-hidden rounded-1 bg-white shadow-[0_2px_10px_#0006] outline-3 -outline-offset-2 outline-lime-600'
					>
						<div className='flex flex-col overflow-y-auto'>
							{options.map(option => {
								return (
									<SelectItem
										key={option.label}
										value={option.label}
										className='px-2 py-1 text-3.5 font-semibold data-active-item:bg-lime-200 data-active-item:outline data-active-item:outline-lime-600'
									/>
								);
							})}
						</div>
					</SelectPopover>
				</SelectProvider>

				{/* <Listbox value={value} onChange={onChange}>
					<ListboxButton className='group/dropdown z-5 flex flex-1 cursor-pointer items-center justify-between rounded-1 bg-zinc-700 outline outline-zinc-800 over:bg-green-800 over:outline-3 over:outline-offset-0! over:outline-lime-600'>
						<Label className='cursor-pointer px-2 py-0.5 text-3.5 font-bold whitespace-nowrap text-white'>
							{label}
						</Label>
						<div className='flex flex-1 items-center gap-2 self-stretch bg-white px-2'>
							<p
								className={clsx(
									'flex-1 text-left',
									value ? 'text-black' : 'text-zinc-400',
								)}
							>
								{value === undefined ? placeholder : optionMap.get(value)}
							</p>

							<div className='flex size-4 items-center justify-center rounded-0.5 group-data-over/dropdown:bg-lime-600 group-data-over/dropdown:text-white'>
								<TriangleDownSvg className='size-2.5' />
							</div>
						</div>
					</ListboxButton>

					<ListboxOptions
						anchor={{ to: 'bottom', gap: 0, padding: 48 }}
						className='z-10 flex w-(--button-width) flex-col rounded-1 bg-white shadow-[0_2px_10px_#0006] outline-3 -outline-offset-2 outline-lime-600'
					>
						{options.map(option => {
							return (
								<ListboxOption
									key={option.label}
									value={option.value}
									className='px-2 py-1 text-3.5 font-semibold data-focus:bg-lime-200 data-focus:outline data-focus:outline-lime-600'
								>
									{option.label}
								</ListboxOption>
							);
						})}
					</ListboxOptions>
				</Listbox> */}
			</div>
		);
	}

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
					className='z-10 flex w-(--button-width) flex-col rounded-2 bg-white shadow-[0_2px_10px_#0006] outline-4 -outline-offset-2 outline-lime-600'
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
