import InputDescription from '@/components/input_fields/InputDescription';
import useAriaId from '@/hooks/useAriaId';
import {
	Select,
	SelectArrow,
	SelectGroup,
	SelectGroupLabel,
	SelectItem,
	SelectLabel,
	SelectPopover,
	SelectProvider,
} from '@ariakit/react';
import clsx from 'clsx';
import { useRef } from 'react';

type DropdownFieldProps<V> = {
	label?: string;
	value: V;
	onChange: (value: NonUndefined<V>) => void;
	options: Option<NonUndefined<V>>[] | GroupedOptions<NonUndefined<V>>[];
	placeholder?: string;
	description?: string;
	compact?: boolean;
	ref?: React.RefObject<HTMLButtonElement | null>;
};

export default function DropdownField<V>({
	label,
	value,
	onChange,
	options,
	placeholder,
	description,
	compact = false,
	ref: passedSelectRef,
}: DropdownFieldProps<V>) {
	const { descriptionId } = useAriaId();
	const internalSelectRef = useRef<HTMLButtonElement>(null);
	const selectRef = passedSelectRef ?? internalSelectRef;

	function getValueLabel() {
		for (const option of options) {
			if ('options' in option) {
				// option group
				for (const subOption of option.options) {
					if (subOption.value === value) return subOption.label;
				}
			} else {
				if (option.value === value) return option.label;
			}
		}

		return undefined;
	}

	const selectedItemLabel =
		value === undefined ? placeholder : getValueLabel() || placeholder;

	if (compact) {
		return (
			<div className='flex h-full'>
				<SelectProvider value={selectedItemLabel}>
					<div className='group/dropdown z-5 flex flex-1 items-center justify-between rounded-1 bg-zinc-700 outline -outline-offset-1 outline-zinc-800 has-focus-visible:bg-green-800 has-focus-visible:outline-3 has-focus-visible:outline-offset-0! has-focus-visible:outline-lime-600 over:bg-green-800 over:outline-3 over:outline-offset-0! over:outline-lime-600'>
						{label && (
							<SelectLabel
								className='cursor-pointer! px-2 py-0.75 text-3.5 font-bold whitespace-nowrap text-white'
								onClick={() => {
									selectRef.current?.click();
								}}
							>
								{label}
							</SelectLabel>
						)}
						<Select
							ref={selectRef}
							className='flex flex-1 items-center gap-2 self-stretch bg-white px-2 outline-none'
						>
							<p
								className={clsx(
									'flex-1 text-left',
									selectedItemLabel !== placeholder
										? 'text-black'
										: 'text-zinc-400',
								)}
							>
								{selectedItemLabel}
							</p>

							<SelectArrow className='transition-transform group-aria-expanded/dropdown:-rotate-180' />
						</Select>
					</div>
					<DropdownFieldPopover options={options} onChange={onChange} />
				</SelectProvider>
			</div>
		);
	}

	return (
		<div className='flex flex-col'>
			<SelectProvider value={selectedItemLabel}>
				<div className='group/dropdown input-wrapper flex cursor-pointer flex-col p-0! input-wrapper-over input-wrapper-has-hover'>
					<SelectLabel
						className='cursor-pointer! px-2 pt-1 input-label'
						onClick={() => {
							selectRef.current?.click();
						}}
					>
						{label}
					</SelectLabel>
					<Select
						aria-describedby={description ? descriptionId : undefined}
						ref={selectRef}
						className='flex flex-1 items-center gap-2 px-2 pb-1 outline-none'
					>
						<p
							className={clsx(
								'flex-1 text-left',
								selectedItemLabel !== placeholder
									? 'text-black'
									: 'text-zinc-400',
							)}
						>
							{selectedItemLabel}
						</p>

						<SelectArrow className='transition-transform group-aria-expanded/dropdown:-rotate-180' />
					</Select>
				</div>
				<DropdownFieldPopover options={options} onChange={onChange} />
			</SelectProvider>

			{description && (
				<InputDescription id={descriptionId}>{description}</InputDescription>
			)}
		</div>
	);
}

type DropdownFieldPopoverProps<V> = {
	onChange: (value: NonUndefined<V>) => void;
	options: Option<NonUndefined<V>>[] | GroupedOptions<NonUndefined<V>>[];
};

function DropdownFieldPopover<V>({
	onChange,
	options,
}: DropdownFieldPopoverProps<V>) {
	return (
		<SelectPopover
			modal
			sameWidth
			fitViewport
			className='dark-menu min-w-0! p-0!'
			gutter={6}
			hideOnEscape={event => {
				// prevents closing dialog if inside a dialog
				event.stopPropagation();
				return true;
			}}
		>
			<div className='flex flex-col overflow-y-auto p-1.5'>
				{options.map(option => {
					if ('options' in option) {
						return (
							<SelectGroup key={option.label} className='flex flex-col'>
								<SelectGroupLabel className='dark-menu-group-label'>
									{option.label}
								</SelectGroupLabel>
								{option.options.map(option => {
									return (
										<SelectItem
											key={JSON.stringify(option.value)}
											value={option.label}
											className='dark-menu-item px-4! py-0.5!'
											onClick={() => {
												onChange(option.value);
											}}
										>
											{option.label}
										</SelectItem>
									);
								})}
							</SelectGroup>
						);
					}
					return (
						<SelectItem
							key={JSON.stringify(option.value)}
							value={option.label}
							className='dark-menu-item'
							onClick={() => {
								onChange(option.value);
							}}
						>
							{option.label}
						</SelectItem>
					);
				})}
			</div>
		</SelectPopover>
	);
}
