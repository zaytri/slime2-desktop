import { deepCopyObject } from '@/contexts/common';
import { useDialog } from '@/contexts/dialog/useDialog';
import { i18nStringTransform } from '@/helpers/i18n';
import type { WidgetSetting } from '@@/json/widgetSettings';
import CheckSvg from '@@/svg/CheckSvg';
import PlusSvg from '@@/svg/PlusSvg';
import XSvg from '@@/svg/XSvg';
import { Checkbox, Field, Fieldset, Label, Legend } from '@headlessui/react';
import { useState } from 'react';
import ColorField from '../input_fields/ColorField';
import DropdownField from '../input_fields/DropdownField';
import MultiSelectField from '../input_fields/MultiSelectField';
import MultiTextField from '../input_fields/MultiTextField';
import NumberField from '../input_fields/NumberField';
import SelectField from '../input_fields/SelectField';
import TextAreaField from '../input_fields/TextAreaField';
import TextField from '../input_fields/TextField';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogContent from './DialogContent';

type SettingData =
	| DistributiveOmit<
			WidgetSetting.NonGroup,
			'label' | 'condition' | 'searchTags'
	  >
	| Omit<
			WidgetSetting.Section,
			'label' | 'condition' | 'searchTags' | 'settings'
	  >
	| Omit<
			WidgetSetting.MultiSection,
			'label' | 'condition' | 'searchTags' | 'settings'
	  >;

type SetWidgetSettingDialogProps = {
	id?: string;
	label?: string;
	condition?: WidgetSetting.NonCategory['condition'];
	searchTags?: WidgetSetting.NonCategory['searchTags'];
	data?: SettingData;
	onSaveCategory?: (id: string, label: string) => void;
	onSaveSetting?: (
		id: string,
		label: string,
		data: {
			condition: WidgetSetting.NonCategory['condition'];
			searchTags: WidgetSetting.NonCategory['searchTags'];
		} & SettingData,
	) => void;
	checkIdExists: (id: string) => boolean;
};

export default function SetWidgetSettingDialog({
	id,
	label,
	onSaveCategory,
	onSaveSetting,
	checkIdExists,
	data,
	condition,
	searchTags,
}: SetWidgetSettingDialogProps) {
	const { closeDialog } = useDialog();
	const [newId, setNewId] = useState<string>(id || '');
	const [newLabel, setNewLabel] = useState<string>(label || '');
	const [newCondition, setNewCondition] = useState<
		{
			id: string;
			value: WidgetSetting.OptionValue;
		}[]
	>(
		Object.entries(condition || {}).map(([id, value]) => {
			return { id, value };
		}),
	);
	const [newData, setNewData] = useState<SettingData>(
		data ?? {
			type: 'text-input',
			defaultValue: '',
		},
	);

	const isCategory = !data;
	const isGroup =
		isCategory ||
		newData.type === 'section' ||
		newData.type === 'multi-section';
	const isAdd = !id && !label;
	const trimmedId = newId.trim();
	const trimmedLabel = newLabel.trim();

	let idCollision = false;
	// only check if newId isn't empty and id isn't the same as newId
	if (trimmedId && (id || '') !== trimmedId) {
		idCollision = checkIdExists(trimmedId);
	}

	let emptyOptions = false;
	if (
		data &&
		(data.type === 'dropdown-input' || data.type === 'select-input',
		data.type === 'multi-select-input') &&
		data.options.length === 0
	) {
		emptyOptions = true;
	}

	const disableSave =
		!trimmedId || !trimmedLabel || idCollision || emptyOptions;

	return (
		<DialogContent className='flex max-h-100 w-160 flex-col justify-between overflow-hidden'>
			<div className='flex flex-1 flex-col gap-2 overflow-y-auto p-4'>
				<div className='grid flex-1 grid-cols-2 gap-x-4 gap-y-2'>
					<div className='flex flex-col gap-1'>
						<TextField
							label='Unique ID'
							compact
							placeholder={isCategory ? 'my-category-id' : 'my-setting-id'}
							autoFocus
							value={newId}
							onChange={setNewId}
						/>

						{idCollision && (
							<strong className='text-3.5 text-rose-900'>
								Error: ID already exists!
							</strong>
						)}
					</div>

					{newData.type === 'text-display' ? (
						<div className='order-last col-span-2'>
							<TextAreaField
								label='Text'
								compact
								placeholder='My Text'
								value={newLabel}
								onChange={setNewLabel}
							/>
						</div>
					) : (
						<TextField
							label='Label'
							compact
							placeholder={isCategory ? 'My Category' : 'My Setting'}
							value={newLabel}
							onChange={setNewLabel}
						/>
					)}

					{!isGroup && (
						<>
							<DropdownField
								label='Type'
								compact
								value={newData.type}
								onChange={newType => {
									switch (newType) {
										case 'button':
										case 'text-display':
										case 'image-input':
										case 'video-input':
										case 'audio-input':
										case 'color-input':
										case 'font-input':
										case 'text-input':
										case 'text-area-input':
										case 'multi-text-input':
											setNewData({ type: newType });
											break;

										case 'number-input':
											setNewData({ type: newType, step: 1 });
											break;

										case 'slider-input':
											setNewData({
												type: newType,
												min: 0,
												max: 100,
												step: 1,
											});
											break;

										case 'toggle-input':
											setNewData({ type: newType, defaultValue: false });
											break;

										case 'dropdown-input':
										case 'select-input':
										case 'multi-select-input':
											setNewData({ type: newType, options: [] });
											break;
									}
								}}
								options={
									[
										{ label: 'Text Display', value: 'text-display' },
										{ label: 'Button', value: 'button' },
										{ label: 'Text Input', value: 'text-input' },
										{ label: 'Text Area Input', value: 'text-area-input' },
										{ label: 'Multi-Text Input', value: 'multi-text-input' },
										{ label: 'Number Input', value: 'number-input' },
										{ label: 'Slider Input', value: 'slider-input' },
										{ label: 'Toggle Input', value: 'toggle-input' },
										{ label: 'Dropdown Input', value: 'dropdown-input' },
										{ label: 'Select Input', value: 'select-input' },
										{
											label: 'Multi-Select Input',
											value: 'multi-select-input',
										},
										{ label: 'Color Input', value: 'color-input' },
										{ label: 'Font Input', value: 'font-input' },
										{ label: 'Image Input', value: 'image-input' },
										{ label: 'Audio Input', value: 'audio-input' },
										{ label: 'Video Input', value: 'video-input' },
									] as {
										label: string;
										value: WidgetSetting.NonGroup['type'];
									}[]
								}
							/>

							{(newData.type === 'text-input' ||
								newData.type === 'text-area-input' ||
								newData.type === 'multi-text-input' ||
								newData.type === 'number-input' ||
								newData.type === 'dropdown-input' ||
								newData.type === 'color-input' ||
								newData.type === 'font-input') && (
								<TextField
									label='Placeholder'
									compact
									value={
										typeof newData.placeholder === 'string'
											? newData.placeholder
											: ''
									}
									onChange={newValue => {
										setNewData({
											...newData,
											placeholder: newValue,
										});
									}}
								/>
							)}

							{(newData.type === 'dropdown-input' ||
								newData.type === 'select-input' ||
								newData.type === 'multi-select-input') && (
								<OptionsField
									values={newData.options}
									onChange={newValues => {
										setNewData({
											...newData,
											options: newValues,
										});
									}}
								/>
							)}

							{newData.type === 'text-input' ||
							newData.type === 'text-area-input' ||
							newData.type === 'image-input' ||
							newData.type === 'audio-input' ||
							newData.type === 'video-input' ||
							newData.type === 'font-input' ? (
								<TextField
									label='Default Value'
									compact
									placeholder='String Value'
									value={newData.defaultValue || ''}
									onChange={newValue => {
										setNewData({
											...newData,
											defaultValue: newValue,
										});
									}}
								/>
							) : newData.type === 'color-input' ? (
								<ColorField
									label='Default Value'
									compact
									placeholder='Color Value'
									value={newData.defaultValue || ''}
									onChange={newValue => {
										setNewData({
											...newData,
											defaultValue: newValue,
										});
									}}
								/>
							) : newData.type === 'number-input' ||
							  newData.type === 'slider-input' ? (
								<NumberField
									label='Default Value'
									compact
									placeholder='Number Value'
									value={
										newData.defaultValue === undefined
											? null
											: newData.defaultValue
									}
									onChange={newValue => {
										setNewData({
											...newData,
											defaultValue: newValue === null ? undefined : newValue,
										});
									}}
								/>
							) : newData.type === 'toggle-input' ? (
								<SelectField
									label='Default Value'
									compact
									value={newData.defaultValue || false}
									onChange={newValue => {
										setNewData({
											...newData,
											defaultValue: newValue,
										});
									}}
									options={[
										{ label: 'True', value: true },
										{ label: 'False', value: false },
									]}
								/>
							) : newData.type === 'dropdown-input' ? (
								<div className='col-span-2'>
									<DropdownField
										label='Default Value'
										compact
										value={newData.defaultValue || newData.options[0]?.value}
										onChange={newOption => {
											setNewData({
												...newData,
												defaultValue: newOption,
											});
										}}
										options={newData.options.map(option => {
											return {
												label: i18nStringTransform(option.label),
												value: option.value,
											};
										})}
									/>
								</div>
							) : newData.type === 'select-input' ? (
								<div className='col-span-2'>
									<SelectField
										label='Default Value'
										compact
										value={newData.defaultValue || newData.options[0]?.value}
										onChange={newOption => {
											setNewData({
												...newData,
												defaultValue: newOption,
											});
										}}
										options={newData.options.map(option => {
											return {
												label: i18nStringTransform(option.label),
												value: option.value,
											};
										})}
									/>
								</div>
							) : newData.type === 'multi-text-input' ? (
								<div className='col-span-2'>
									<MultiTextField
										label='Default Values'
										compact
										placeholder='String Value'
										values={newData.defaultValue || []}
										onChange={newValues => {
											setNewData({
												...newData,
												defaultValue:
													newValues.length === 0 ? undefined : newValues,
											});
										}}
									/>
								</div>
							) : newData.type === 'multi-select-input' ? (
								<div className='col-span-2'>
									<MultiSelectField
										label='Default Values'
										compact
										values={newData.defaultValue || []}
										options={newData.options.map(option => {
											return {
												label: i18nStringTransform(option.label),
												value: option.value,
											};
										})}
										onChange={newValues => {
											setNewData({
												...newData,
												defaultValue:
													newValues.length === 0 ? undefined : newValues,
											});
										}}
									/>
								</div>
							) : null}

							{(newData.type === 'number-input' ||
								newData.type === 'slider-input') && (
								<>
									<div className='flex gap-2'>
										<NumberField
											label='Min'
											compact
											value={newData.min === undefined ? null : newData.min}
											onChange={newValue => {
												setNewData({
													...newData,
													min: newValue === null ? undefined : newValue,
												});
											}}
										/>

										<NumberField
											label='Max'
											compact
											value={newData.max === undefined ? null : newData.max}
											onChange={newValue => {
												setNewData({
													...newData,
													max: newValue === null ? undefined : newValue,
												});
											}}
										/>
									</div>
									<StepField
										value={newData.step}
										onChange={newValue => {
											setNewData({
												...newData,
												step: newValue === null ? undefined : newValue,
											});
										}}
									/>
								</>
							)}
						</>
					)}
				</div>

				{!isGroup &&
					newData.type !== 'button' &&
					newData.type !== 'text-display' &&
					newData.type !== 'image-display' && (
						<div className='shrink-0'>
							<TextAreaField
								label='Description'
								compact
								value={
									typeof newData.description === 'string'
										? newData.description
										: ''
								}
								onChange={newValue => {
									setNewData({
										...newData,
										description: newValue,
									});
								}}
							/>
						</div>
					)}
			</div>

			<div className='flex justify-end gap-4 border-t border-zinc-800 p-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					disabled={disableSave}
					onClick={() => {
						if (disableSave) return;

						if (isCategory && onSaveCategory) {
							onSaveCategory(trimmedId, trimmedLabel);
						} else if (onSaveSetting) {
							onSaveSetting(trimmedId, trimmedLabel, {
								...newData,
								condition:
									newCondition.length === 0
										? undefined
										: newCondition.reduce(
												(previousValue, currentValue) => {
													const newValue: WidgetSetting.NonCategory['condition'] =
														{ ...previousValue };

													const trimmedId = currentValue.id;
													if (trimmedId) {
														newValue[trimmedId] = currentValue.value;
													}

													return newValue;
												},
												{} as WidgetSetting.NonCategory['condition'],
											),
								searchTags: searchTags,
							});
						}

						closeDialog();
					}}
				>
					{isAdd ? 'Add' : 'Update'}
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}

type StepFieldProps = {
	value?: number | 'any';
	onChange: (value: number | 'any' | null) => void;
};

function StepField({ value, onChange }: StepFieldProps) {
	return (
		<div className='relative'>
			<div className='absolute inset-0 flex items-center'>
				<div className='h-5 flex-1 border border-zinc-500 bg-zinc-300'></div>
			</div>
			<div className='relative flex items-center gap-2'>
				<NumberField
					compact
					disabled={value === 'any'}
					label='Step (Interval)'
					value={value === 'any' || value === undefined ? null : value}
					onChange={onChange}
				/>

				<Field className='flex self-stretch'>
					<Checkbox
						className='group/check flex flex-1 items-center rounded-1 bg-white px-2 py-0.5 outline outline-zinc-800 data-over:bg-lime-200 data-over:outline-2 data-over:outline-lime-600'
						checked={value === 'any'}
						onChange={newCheckedValue => {
							onChange(newCheckedValue ? 'any' : null);
						}}
					>
						<Label className='flex cursor-pointer items-center gap-1 text-3.5 font-semibold select-none'>
							<div className='flex items-center justify-center rounded-1 border-2 border-zinc-700 bg-white p-0.5 group-data-checked/check:bg-zinc-700!'>
								<CheckSvg className='size-3 text-transparent group-data-checked/check:text-white' />
							</div>
							<p className='-mb-px'>Any</p>
						</Label>
					</Checkbox>
				</Field>
			</div>
		</div>
	);
}

type OptionsFieldProps = {
	values: WidgetSetting.Options;
	onChange: (options: WidgetSetting.Options) => void;
};

function OptionsField({ values, onChange }: OptionsFieldProps) {
	const [valueType, setValueType] = useState<DefaultValueOption>(
		values !== undefined && values.length > 0
			? typeof values[values.length - 1]?.value === 'number'
				? 'number'
				: typeof values[values.length - 1]?.value === 'boolean'
					? 'boolean'
					: 'string'
			: 'string',
	);

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
	}

	function removeOptionAtIndex(index: number) {
		const newValues = [...(values || [])];
		newValues.splice(index, 1);
		onChange(newValues);
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
	}

	return (
		<div className='col-span-2 flex flex-col gap-2'>
			<Fieldset className='relative flex flex-col gap-2'>
				<Legend
					as='div'
					className='relative flex items-center self-start rounded-1 bg-zinc-700 px-2 py-0.5 font-extrabold whitespace-nowrap text-white outline outline-zinc-800'
				>
					<p>Options</p>
					<div className='absolute inset-x-2 top-full'>
						<div className='my-px h-16 w-full border-x border-zinc-500 bg-zinc-300'></div>
					</div>
				</Legend>

				<div className='relative flex flex-1 flex-col gap-2'>
					<div className='relative'>
						<TextField
							label='Unique Label'
							compact
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
								] as { label: string; value: DefaultValueOption }[]
							}
						/>

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
				<div className='flex flex-col gap-1.5 pb-2 pl-4'>
					{values.map((option, index) => {
						return (
							<div key={`${option.value}_${index}`} className='flex gap-1'>
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
