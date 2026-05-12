import InputDescription from '@/components/input_fields/InputDescription';
import useAriaId from '@/hooks/useAriaId';
import { useSystemFontsQuery } from '@/hooks/useSystemFontsQuery';
import {
	Select,
	SelectArrow,
	SelectItem,
	SelectLabel,
	SelectPopover,
	SelectProvider,
} from '@ariakit/react';
import clsx from 'clsx';
import { Suspense, useRef } from 'react';

type FontFieldProps = {
	value: string;
	onChange: (value: string) => void;
	label: string;
	description?: string;
	placeholder?: string;
};

export default function FontField({
	value,
	onChange,
	label,
	description,
	placeholder,
}: FontFieldProps) {
	const { descriptionId } = useAriaId();
	const selectRef = useRef<HTMLButtonElement>(null);

	return (
		<div className='flex flex-col'>
			<SelectProvider value={value}>
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
						ref={selectRef}
						aria-describedby={description ? descriptionId : undefined}
						className='flex flex-1 items-center gap-2 px-2 pb-1 outline-none'
					>
						<p
							className={clsx(
								'flex-1 text-left',
								value ? 'text-black' : 'text-zinc-400',
							)}
							style={{
								fontFamily: value ? `"${value}", sans-serif` : undefined,
							}}
						>
							{value || placeholder || 'Select font...'}
						</p>
						<SelectArrow className='transition-transform group-aria-expanded/dropdown:-rotate-180' />
					</Select>
				</div>

				<FontPopover onChange={onChange} />
			</SelectProvider>

			{description && (
				<InputDescription id={descriptionId}>{description}</InputDescription>
			)}
		</div>
	);
}

type FontPopoverProps = {
	onChange: (value: string) => void;
};

function FontPopover({ onChange }: FontPopoverProps) {
	return (
		<SelectPopover
			modal
			sameWidth
			fitViewport
			className='dark-menu p-0!'
			gutter={6}
			hideOnEscape={event => {
				// prevents closing dialog if inside a dialog
				event.stopPropagation();
				return true;
			}}
		>
			<div className='flex flex-col overflow-y-auto p-1.5'>
				<p className='dark-menu-item hidden only:block'>
					Loading local fonts...
				</p>
				<FontRender onChange={onChange} />
			</div>
		</SelectPopover>
	);
}

type FontRenderProps = {
	onChange: (value: string) => void;
};

function FontRender({ onChange }: FontRenderProps) {
	const { data } = useSystemFontsQuery();

	return (
		<Suspense fallback={null}>
			{(data || []).map(font => {
				return (
					<SelectItem
						key={font}
						value={font}
						className='dark-menu-item flex gap-8! px-3! py-1! font-[weight:initial]!'
						style={{ fontFamily: `${font}, sans-serif` }}
						onClick={() => {
							onChange(font);
						}}
					>
						<p className='flex-1 text-nowrap'>{font}</p>
						<p className='flex-1 truncate'>
							0123456789 Lorem ipsum dolor sit amet, consectetur adipiscing
							elit, sed do eiusmod tempor incididunt ut labore et dolore magna
						</p>
					</SelectItem>
				);
			})}
		</Suspense>
	);
}
