import InputDescription from '@/components/input_fields/InputDescription';
import ArrowTurnDownLeftSvg from '@/components/svg/ArrowTurnDownLeftSvg';
import XSvg from '@/components/svg/XSvg';
import { Field, Input, Label } from '@headlessui/react';
import clsx from 'clsx';
import { useRef, useState } from 'react';

type MultiTextFieldProps = {
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
	description?: string;
	placeholder?: string;
	compact?: boolean;
};

export default function MultiTextField({
	label,
	values,
	onChange,
	description,
	placeholder,
	compact,
}: MultiTextFieldProps) {
	const [inputValue, setInputValue] = useState<string>('');
	const inputRef = useRef<HTMLInputElement>(null);

	function removeValueAtIndex(index: number) {
		const newValues = [...values];
		newValues.splice(index, 1);
		onChange(newValues);
	}

	function addValue() {
		const newValue = inputValue.trim();
		if (newValue) {
			onChange([...values, newValue]);
		}

		setInputValue('');
	}

	function removeLastValue() {
		onChange(values.slice(0, -1));
	}

	if (compact)
		return (
			<Field className='flex flex-col overflow-hidden rounded-1 bg-zinc-700 outline -outline-offset-1 outline-zinc-800 has-data-focus:bg-green-800 has-data-focus:outline-3 has-data-focus:outline-lime-600'>
				{label && (
					<Label className='px-2 py-0.5 text-3.5 font-bold whitespace-nowrap text-white'>
						{label}
					</Label>
				)}

				<div className='flex flex-wrap gap-1 bg-white p-1'>
					{values.map((value, index) => {
						return (
							<button
								key={`${value}-${index}`}
								type='button'
								className='group -outline-offset-2!over:bg-rose-200 flex items-center gap-1.5 rounded-1 border border-zinc-400 bg-zinc-200 px-1.5 text-3.5 font-semibold text-zinc-800 -outline-offset-1! over:bg-rose-200 over:text-rose-900 over:outline-3 over:outline-rose-700'
								onClick={() => {
									removeValueAtIndex(index);
								}}
								// allow removing value when pressing backspace/delete/clear
								// and using arrow keys to navigate to other values
								onKeyDown={event => {
									// only run this on this focused element
									if (document.activeElement !== event.currentTarget) return;

									if (
										event.key === 'Backspace' ||
										event.key === 'Delete' ||
										event.key === 'Clear'
									) {
										event.preventDefault();
										removeValueAtIndex(index);
									}

									const currentButton = event.currentTarget;

									const buttonToFocus =
										event.key === 'ArrowRight' || event.key === 'ArrowDown'
											? // get the next button
												// or the first button if this is the last button
												index !== values.length - 1
												? currentButton.nextElementSibling
												: currentButton.parentElement?.querySelector('button')
											: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
												? // get the previous button
													// or the last button if this is the first button
													index !== 0
													? currentButton.previousElementSibling
													: currentButton.parentElement?.querySelector(
															'button:last-of-type',
														)
												: null;

									if (buttonToFocus) {
										event.preventDefault();
										(buttonToFocus as HTMLButtonElement).focus();
									}
								}}
							>
								<span className='sr-only'>Delete</span>
								<p>{value}</p>
								<XSvg className='size-2 text-zinc-400 group-over:text-rose-700' />
							</button>
						);
					})}

					<div className='flex items-center gap-1'>
						<Input
							ref={inputRef}
							autoComplete='off'
							aria-autocomplete='none'
							value={inputValue}
							placeholder={placeholder}
							className='peer w-32 px-1 input-class'
							onChange={event => {
								setInputValue(event.target.value);
							}}
							// add value when pressing enter
							// remove last value when pressing backspace
							onKeyDown={event => {
								// only run this on this focused element
								if (document.activeElement !== event.currentTarget) return;

								if (event.key === 'Enter') {
									addValue();
								}

								if (event.key === 'Backspace') {
									if (inputValue.length === 0 && values.length > 0) {
										removeLastValue();
									}
								}
							}}
							// add value when leaving text box to help people who don't
							// realize that they should press enter to save
							onBlur={_event => {
								addValue();
							}}
						/>
						<ArrowTurnDownLeftSvg className='hidden size-3 text-zinc-500 peer-data-focus:block' />
					</div>

					<div
						className='flex-1 cursor-text'
						onClick={() => {
							inputRef.current?.focus();
						}}
					></div>
				</div>
			</Field>
		);

	return (
		<Field>
			<div className='input-wrapper flex-col input-wrapper-focus-visible'>
				<Label className='input-label'>{label}</Label>

				<div
					className={clsx(
						'flex flex-wrap gap-1.5',
						values.length > 0 && 'py-0.5',
					)}
				>
					{values.map((value, index) => {
						return (
							<button
								key={`${value}-${index}`}
								type='button'
								className='group -outline-offset-2!over:bg-rose-200 flex items-center gap-1.5 rounded-1 border border-zinc-400 bg-zinc-200 px-1.5 text-3.5 font-semibold text-zinc-800 -outline-offset-1! over:bg-rose-200 over:text-rose-900 over:outline-3 over:outline-rose-700'
								onClick={() => {
									removeValueAtIndex(index);
								}}
								// allow removing value when pressing backspace/delete/clear
								// and using arrow keys to navigate to other values
								onKeyDown={event => {
									// only run this on this focused element
									if (document.activeElement !== event.currentTarget) return;

									if (
										event.key === 'Backspace' ||
										event.key === 'Delete' ||
										event.key === 'Clear'
									) {
										event.preventDefault();
										removeValueAtIndex(index);
									}

									const currentButton = event.currentTarget;

									const buttonToFocus =
										event.key === 'ArrowRight' || event.key === 'ArrowDown'
											? // get the next button
												// or the first button if this is the last button
												index !== values.length - 1
												? currentButton.nextElementSibling
												: currentButton.parentElement?.querySelector('button')
											: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
												? // get the previous button
													// or the last button if this is the first button
													index !== 0
													? currentButton.previousElementSibling
													: currentButton.parentElement?.querySelector(
															'button:last-of-type',
														)
												: null;

									if (buttonToFocus) {
										event.preventDefault();
										(buttonToFocus as HTMLButtonElement).focus();
									}
								}}
							>
								<p>{value}</p>
								<XSvg className='size-2 text-zinc-400 group-over:text-rose-700' />
							</button>
						);
					})}

					<div className='flex items-center gap-1'>
						<Input
							ref={inputRef}
							autoComplete='off'
							aria-autocomplete='none'
							value={inputValue}
							placeholder={placeholder}
							className='peer w-32 input-class'
							onChange={event => {
								setInputValue(event.target.value);
							}}
							// add value when pressing enter
							// remove last value when pressing backspace
							onKeyDown={event => {
								// only run this on this focused element
								if (document.activeElement !== event.currentTarget) return;

								if (event.key === 'Enter') {
									addValue();
								}

								if (event.key === 'Backspace') {
									if (inputValue.length === 0 && values.length > 0) {
										removeLastValue();
									}
								}
							}}
							// add value when leaving text box to help people who don't
							// realize that they should press enter to save
							onBlur={_event => {
								addValue();
							}}
						/>
						<ArrowTurnDownLeftSvg className='hidden size-3 text-zinc-500 peer-data-focus:block' />
					</div>

					<div
						className='flex-1 cursor-text'
						onClick={() => {
							inputRef.current?.focus();
						}}
					></div>
				</div>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
