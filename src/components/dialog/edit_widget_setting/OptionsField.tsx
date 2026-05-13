import DropdownField from '@/components/input_fields/DropdownField';
import NumberField from '@/components/input_fields/NumberField';
import SelectField from '@/components/input_fields/SelectField';
import TextField from '@/components/input_fields/TextField';
import { deepCopyObject } from '@/contexts/common';
import { swapItems } from '@/helpers/array';
import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting } from '@@/json/widgetSettings';
import ArrowDownSvg from '@@/svg/ArrowDownSvg';
import ArrowUpSvg from '@@/svg/ArrowUpSvg';
import PlusSvg from '@@/svg/PlusSvg';
import XSvg from '@@/svg/XSvg';
import { Fieldset, Legend } from '@headlessui/react';
import { useRef, useState } from 'react';

type DefaultValueOption = 'string' | 'number' | 'boolean';

type OptionsFieldProps = {
	values: WidgetSetting.Options;
	onChange: (options: WidgetSetting.Options) => void;
};

export default function OptionsField({ values, onChange }: OptionsFieldProps) {
	const [valueType, setValueType] = useState<DefaultValueOption>(
		values !== undefined && values.length > 0
			? typeof values[values.length - 1]?.value === 'number'
				? 'number'
				: typeof values[values.length - 1]?.value === 'boolean'
					? 'boolean'
					: 'string'
			: 'string',
	);

	const labelFieldRef = useRef<HTMLInputElement>(null);
	const [labelError, setLabelError] = useState('');
	const [valueError, setValueError] = useState('');
	const [label, setLabel] = useState('');
	const [text, setText] = useState('');
	const [number, setNumber] = useState<number | null>(null);
	const [boolean, setBoolean] = useState(false);

	function resetInputValue() {
		setText('');
		setNumber(null);
		setBoolean(false);
		setValueError('');
	}

	function removeOptionAtIndex(index: number) {
		const newValues = [...(values || [])];
		newValues.splice(index, 1);
		onChange(newValues);
	}

	function swapOptionIndex(oldIndex: number, newIndex: number) {
		const newValues = [...(values || [])];
		onChange(swapItems(newValues, oldIndex, newIndex));
	}

	function addOption() {
		let error = false;

		const trimmedLabel = label.trim();
		if (!trimmedLabel) {
			setLabelError('Label Empty!');
			error = true;
		}

		const trimmedText = text.trim();
		let newValue: WidgetSetting.OptionValue | null = null;
		if (valueType === 'string' && trimmedText) {
			newValue = trimmedText;
		} else if (valueType === 'number' && number !== null) {
			newValue = number;
		} else if (valueType === 'boolean') {
			newValue = boolean;
		}

		if (newValue === null) {
			setValueError('Value Empty!');
			error = true;
		}

		values.forEach(option => {
			if (i18nStringTransform(option.label) === label) {
				setLabelError('Duplicate Label!');
				error = true;
			}

			if (option.value === newValue) {
				setValueError(
					valueType === 'boolean' ? 'Value Exists!' : 'Duplicate Value!',
				);
				error = true;
			}
		});

		if (error || newValue === null) return;

		const newValues = deepCopyObject(values);
		onChange([...newValues, { label: trimmedLabel, value: newValue }]);

		setLabel('');
		resetInputValue();
		labelFieldRef.current?.focus();
	}

	return (
		<div className='col-span-2 flex flex-col gap-2 py-2'>
			<Fieldset className='relative flex flex-col gap-2'>
				<div className='relative flex justify-between gap-2'>
					<div className='absolute inset-0 flex items-center'>
						<div className='h-5 flex-1 border border-zinc-500 bg-zinc-300'></div>
					</div>

					<Legend
						as='div'
						className='relative flex flex-1 items-center self-start rounded-1 bg-zinc-700 px-2 py-0.5 font-extrabold whitespace-nowrap text-white outline outline-zinc-800'
					>
						<p>Options</p>
						<div className='absolute top-full left-1.5'>
							<div className='my-px h-16 w-5 border-x border-zinc-500 bg-zinc-300'></div>
						</div>
					</Legend>

					<div className='flex-1'>
						<DropdownField
							label='Value Type'
							compact
							value={valueType}
							onChange={newValueType => {
								setValueType(newValueType);
								resetInputValue();
							}}
							options={
								[
									{ label: 'String', value: 'string' },
									{ label: 'Number', value: 'number' },
									{ label: 'Boolean', value: 'boolean' },
								] as Option<DefaultValueOption>[]
							}
						/>
					</div>
				</div>

				<div className='relative flex flex-1 flex-col gap-2'>
					<div className='relative'>
						<TextField
							label='Unique Label'
							compact
							ref={labelFieldRef}
							placeholder='Option 1'
							value={label}
							onChange={value => {
								setLabel(value);
								setLabelError('');
							}}
						/>

						{labelError && (
							<p className='absolute inset-y-1 right-1 flex items-center rounded-1 bg-rose-900 px-1.5 text-3.5 font-bold text-white outline outline-rose-950'>
								{labelError}
							</p>
						)}
					</div>

					<div className='relative flex gap-2'>
						<div className='absolute inset-0 flex items-center'>
							<div className='h-5 flex-1 border border-zinc-500 bg-zinc-300'></div>
						</div>

						<div className='relative flex-1'>
							{valueType === 'string' && (
								<TextField
									label='Unique Value'
									compact
									placeholder='String'
									value={text}
									onChange={value => {
										setText(value);
										setValueError('');
									}}
									onEnterKey={addOption}
								/>
							)}

							{valueType === 'number' && (
								<NumberField
									label='Unique Value'
									compact
									placeholder='Number'
									value={number}
									onChange={value => {
										setNumber(value);
										setValueError('');
									}}
									onEnterKey={addOption}
								/>
							)}

							{valueType === 'boolean' && (
								<SelectField
									label='Unique Value'
									compact
									value={boolean}
									onChange={value => {
										setBoolean(value);
										setValueError('');
									}}
									options={[
										{ label: 'True', value: true },
										{ label: 'False', value: false },
									]}
								/>
							)}

							{valueError && (
								<p className='absolute inset-y-1 right-1 flex items-center rounded-1 bg-rose-900 px-1.5 text-3.5 font-bold text-white outline outline-rose-950'>
									{valueError}
								</p>
							)}
						</div>

						<button
							type='button'
							className='z-5 flex items-center justify-center gap-1 rounded-1 bg-zinc-700 px-2 text-3.5 font-bold text-white outline outline-zinc-800 over:bg-green-800 over:outline-3 over:outline-offset-0! over:outline-lime-600'
							onClick={addOption}
						>
							<PlusSvg className='size-2.5' />
							<p>Add</p>
						</button>
					</div>
				</div>
			</Fieldset>

			{values.length > 0 && (
				<div className='flex flex-col gap-1.5'>
					{values.map((option, index) => {
						const canSwapUp = index > 0;
						const canSwapDown = index < values.length - 1;

						return (
							<div key={`${option.value}_${index}`} className='flex gap-1'>
								<button
									disabled={!canSwapUp}
									type='button'
									className='rounded-1 px-1.5 text-zinc-800 disabled:text-zinc-400 over:bg-lime-600 over:text-white over:outline over:outline-offset-0! over:outline-lime-700'
									onClick={() => {
										if (canSwapUp) swapOptionIndex(index, index - 1);
									}}
								>
									<span className='sr-only'>Move Up</span>
									<ArrowUpSvg className='size-3.5' />
								</button>

								<button
									disabled={!canSwapDown}
									type='button'
									className='rounded-1 px-1.5 text-zinc-800 disabled:text-zinc-400 over:bg-lime-600 over:text-white over:outline over:outline-offset-0! over:outline-lime-700'
									onClick={() => {
										if (canSwapDown) swapOptionIndex(index, index + 1);
									}}
								>
									<span className='sr-only'>Move Down</span>
									<ArrowDownSvg className='size-3.5' />
								</button>

								<div className='flex flex-1 rounded-1 bg-zinc-700 text-3.5 outline outline-offset-0! outline-zinc-800'>
									<div className='flex flex-1 items-center'>
										<p className='px-2 py-0.5 font-bold text-white'>Label</p>
										<p className='flex flex-1 items-center self-stretch bg-white/75 px-1 font-bold'>
											{i18nStringTransform(option.label)}
										</p>
									</div>
									<div className='flex flex-1 items-center'>
										<p className='px-2 py-0.5 font-bold text-white'>Value</p>
										<p className='flex flex-1 items-center self-stretch bg-white/75 px-1 font-mono'>
											{JSON.stringify(option.value)}
										</p>
									</div>
								</div>

								<button
									type='button'
									className='rounded-1 px-1.5 text-zinc-800 over:bg-rose-800 over:text-white over:outline over:outline-offset-0! over:outline-rose-900'
									onClick={() => {
										removeOptionAtIndex(index);
									}}
								>
									<span className='sr-only'>Delete</span>
									<XSvg className='size-4' />
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
