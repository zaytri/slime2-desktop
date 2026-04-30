import InputDescription from '@/components/input_fields/InputDescription';
import TriangleDownSvg from '@/components/svg/TriangleDownSvg';
import { useSystemFontsQuery } from '@/hooks/useSystemFontsQuery';
import {
	Field,
	Label,
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
} from '@headlessui/react';
import clsx from 'clsx';
import { memo } from 'react';

type FontFieldProps = {
	value: string;
	onChange: (value: string) => void;
	label: string;
	description?: string;
	placeholder?: string;
};

const FontField = memo(function FontField({
	value,
	onChange,
	label,
	description,
	placeholder,
}: FontFieldProps) {
	const { data, isLoading } = useSystemFontsQuery();

	return (
		<Field className='relative'>
			<Listbox value={value} onChange={onChange}>
				<ListboxButton className='group/dropdown input-wrapper flex cursor-pointer items-center input-wrapper-over input-wrapper-has-hover'>
					<div className='flex flex-1 flex-col'>
						<Label className='cursor-pointer input-label'>{label}</Label>

						<p
							className={clsx(value ? 'text-black' : 'text-zinc-400')}
							style={{ fontFamily: `"${value}", sans-serif` }}
						>
							{value || placeholder || 'Select font...'}
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
					{isLoading ? (
						<p className='px-3 py-1'>Loading local fonts...</p>
					) : (
						data.map(font => {
							return (
								<ListboxOption
									key={font}
									value={font}
									className='flex gap-8 px-3 py-1 data-focus:bg-lime-200 data-focus:outline data-focus:outline-lime-600'
									style={{ fontFamily: `${font}, sans-serif` }}
								>
									<p className='flex-1 text-nowrap'>{font}</p>
									<p className='flex-1 truncate'>
										0123456789 Lorem ipsum dolor sit amet, consectetur
										adipiscing elit, sed do eiusmod tempor incididunt ut labore
										et dolore magna aliqua. Ut enim ad minim veniam, quis
										nostrud exercitation ullamco laboris nisi ut aliquip ex ea
										commodo consequat. Duis aute irure dolor in reprehenderit in
										voluptate velit esse cillum dolore eu fugiat nulla pariatur.
										Excepteur sint occaecat cupidatat non proident, sunt in
										culpa qui officia deserunt mollit anim id est laborum
									</p>
								</ListboxOption>
							);
						})
					)}
				</ListboxOptions>
			</Listbox>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
});

export default FontField;
