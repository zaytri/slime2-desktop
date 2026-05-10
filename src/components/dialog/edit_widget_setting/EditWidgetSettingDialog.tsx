import ColorField from '@/components/input_fields/ColorField';
import DropdownField from '@/components/input_fields/DropdownField';
import MultiSelectField from '@/components/input_fields/MultiSelectField';
import MultiTextField from '@/components/input_fields/MultiTextField';
import NumberField from '@/components/input_fields/NumberField';
import SelectField from '@/components/input_fields/SelectField';
import TextAreaField from '@/components/input_fields/TextAreaField';
import TextField from '@/components/input_fields/TextField';
import { deepCopyObject } from '@/contexts/common';
import { useDialog } from '@/contexts/dialog/useDialog';
import { i18nStringTransform } from '@/helpers/i18n';
import {
	SECTION_SETTING_OPTIONS,
	SETTINGS_DATA,
	type WidgetSetting,
} from '@@/json/widgetSettings';
import CheckSvg from '@@/svg/CheckSvg';
import PlusSvg from '@@/svg/PlusSvg';
import XSvg from '@@/svg/XSvg';
import { Checkbox, Field, Fieldset, Label, Legend } from '@headlessui/react';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';
import UniqueIdField from './UniqueIdField';

type SettingData = Extract<
	DistributiveOmit<WidgetSetting.NonCategory, 'label'>,
	{ type: WidgetSetting.NonGroup['type'] }
>;

type EditWidgetSettingDialogProps = {
	id?: string;
	label?: string;
	data: SettingData;
	idExists: (id: string) => boolean;
	onSave: (id: string, label: string, data: SettingData) => void;
};

export default function EditWidgetSettingDialog({
	id,
	label,
	data,
	onSave,
	idExists,
}: EditWidgetSettingDialogProps) {
	const { closeDialog } = useDialog();
	const [newId, setNewId] = useState<string>(id || '');
	const [idError, setIdError] = useState('');
	const [newLabel, setNewLabel] = useState<string>(label || '');
	const [newData, setNewData] = useState<SettingData>(data);

	const trimmedId = newId.trim();
	const trimmedLabel = newLabel.trim();

	const emptyOptions =
		(data.type === 'dropdown-input' ||
			data.type === 'select-input' ||
			data.type === 'multi-select-input') &&
		data.options.length === 0;

	const disableSave = !trimmedId || !trimmedLabel || !!idError || emptyOptions;

	function onChangeId(id: string) {
		setNewId(id);
		setIdError('');
	}

	return (
		<DialogContent className='flex max-h-160 w-160 flex-col justify-between overflow-hidden'>
			<div className='flex flex-col gap-2 overflow-y-auto p-4'>
				<div className='grid flex-1 grid-cols-2 items-start gap-x-4 gap-y-2'>
					{newData.type === 'text-display' ? (
						<div className='order-last col-span-2'>
							<TextAreaField
								label='Label'
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
							placeholder='My Setting'
							value={newLabel}
							onChange={setNewLabel}
						/>
					)}

					<UniqueIdField value={newId} onChange={onChangeId} error={idError} />

					<DropdownField
						label='Type'
						compact
						value={newData.type}
						onChange={newType => {
							setNewData(SETTINGS_DATA[newType].defaultData);
						}}
						options={SECTION_SETTING_OPTIONS}
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

					{newData.type !== 'button' &&
						newData.type !== 'text-display' &&
						newData.type !== 'image-display' && (
							<DefaultValueField
								data={newData}
								onChange={newDefaultValue => {
									if (newDefaultValue === undefined) {
										setNewData({
											...newData,
											defaultValue: undefined,
										});
										return;
									}

									switch (newData.type) {
										case 'text-input':
										case 'text-area-input':
										case 'image-input':
										case 'audio-input':
										case 'video-input':
										case 'font-input':
										case 'color-input':
											if (typeof newDefaultValue === 'string') {
												setNewData({
													...newData,
													defaultValue: newDefaultValue,
												});
											}
											break;
										case 'number-input':
										case 'slider-input':
											if (typeof newDefaultValue === 'number') {
												setNewData({
													...newData,
													defaultValue: newDefaultValue,
												});
											}
											break;
										case 'toggle-input':
											if (typeof newDefaultValue === 'boolean') {
												setNewData({
													...newData,
													defaultValue: newDefaultValue,
												});
											}
											break;
										case 'dropdown-input':
										case 'select-input':
											if (
												typeof newDefaultValue === 'string' ||
												typeof newDefaultValue === 'number' ||
												typeof newDefaultValue === 'boolean'
											) {
												setNewData({
													...newData,
													defaultValue: newDefaultValue,
												});
											}
											break;
										case 'multi-text-input':
											if (
												Array.isArray(newDefaultValue) &&
												newDefaultValue.every(value => {
													return typeof value === 'string';
												})
											) {
												setNewData({
													...newData,
													defaultValue: newDefaultValue as string[],
												});
											}
											break;
										case 'multi-select-input':
											if (Array.isArray(newDefaultValue)) {
												setNewData({
													...newData,
													defaultValue: newDefaultValue,
												});
											}
									}
								}}
							/>
						)}

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
				</div>

				{newData.type !== 'button' &&
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

						// only check if id has been changed
						if (id !== trimmedId && idExists(trimmedId)) {
							setIdError('ID already exists!');
							return;
						}

						const copiedData = deepCopyObject(newData);

						if ('defaultValue' in copiedData) {
							if (typeof copiedData.defaultValue === 'string') {
								// trim defaultValue string, remove if empty
								copiedData.defaultValue =
									copiedData.defaultValue.trim() || undefined;
							} else if (
								Array.isArray(copiedData.defaultValue) &&
								copiedData.defaultValue.length === 0
							) {
								// remove empty defaultValue array
								copiedData.defaultValue = undefined;
							}
						}

						// trim placeholder, remove if empty
						if (
							'placeholder' in copiedData &&
							copiedData.placeholder !== undefined
						) {
							if (typeof copiedData.placeholder === 'string') {
								copiedData.placeholder =
									copiedData.placeholder.trim() || undefined;
							} else {
								for (const [i18key, placeholder] of Object.entries(
									copiedData.placeholder,
								)) {
									const trimmedPlaceholder = placeholder.trim();
									if (!trimmedPlaceholder) {
										delete copiedData.placeholder[i18key];
									} else {
										copiedData.placeholder[i18key] = trimmedPlaceholder;
									}
								}
							}
						}

						// trim description, remove if empty
						if (
							'description' in copiedData &&
							copiedData.description !== undefined
						) {
							if (typeof copiedData.description === 'string') {
								copiedData.description =
									copiedData.description.trim() || undefined;
							} else {
								for (const [i18key, description] of Object.entries(
									copiedData.description,
								)) {
									const trimmedDescription = description.trim();
									if (!trimmedDescription) {
										delete copiedData.description[i18key];
									} else {
										copiedData.description[i18key] = trimmedDescription;
									}
								}
							}
						}

						onSave(trimmedId, trimmedLabel, copiedData);
						closeDialog();
					}}
				>
					{!id ? 'Add' : 'Update'}
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

type DefaultValueOption = 'string' | 'number' | 'boolean';

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
							label='Option Type'
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
					</div>
				</div>

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
				<div className='flex flex-col gap-1.5 pl-4'>
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

type DefaultValueFieldProps = {
	data: DistributivePick<WidgetSetting.AnyInput, 'type' | 'defaultValue'>;
	options?: (
		| WidgetSetting.Input.Dropdown
		| WidgetSetting.Input.Select
		| WidgetSetting.Input.MultiSelect
	)['options'];
	onChange: (value: WidgetSetting.AnyInput['defaultValue']) => void;
};

function DefaultValueField({
	data,
	options = [],
	onChange,
}: DefaultValueFieldProps) {
	const label = 'Default Value';

	switch (data.type) {
		case 'text-input':
		case 'text-area-input':
		case 'image-input':
		case 'audio-input':
		case 'video-input':
		case 'font-input':
			return (
				<TextField
					label={label}
					compact
					placeholder='String Value'
					value={data.defaultValue || ''}
					onChange={onChange}
				/>
			);

		case 'color-input':
			return (
				<ColorField
					label={label}
					compact
					placeholder='Color Value'
					value={data.defaultValue || ''}
					onChange={onChange}
				/>
			);

		case 'number-input':
		case 'slider-input':
			return (
				<NumberField
					label={label}
					compact
					placeholder='Number Value'
					value={data.defaultValue === undefined ? null : data.defaultValue}
					onChange={newValue => {
						onChange(newValue === null ? undefined : newValue);
					}}
				/>
			);

		case 'toggle-input':
			return (
				<SelectField
					label={label}
					compact
					value={data.defaultValue || false}
					onChange={onChange}
					options={[
						{ label: 'True', value: true },
						{ label: 'False', value: false },
					]}
				/>
			);

		case 'dropdown-input':
			return (
				<div className='col-span-2'>
					<DropdownField
						label={label}
						compact
						value={data.defaultValue || options[0]?.value}
						onChange={onChange}
						options={options.map(option => {
							return {
								label: i18nStringTransform(option.label),
								value: option.value,
							};
						})}
					/>
				</div>
			);

		case 'select-input':
			return (
				<div className='col-span-2'>
					<SelectField
						label={label}
						compact
						value={data.defaultValue || options[0]?.value}
						onChange={onChange}
						options={options.map(option => {
							return {
								label: i18nStringTransform(option.label),
								value: option.value,
							};
						})}
					/>
				</div>
			);

		case 'multi-text-input':
			return (
				<div className='col-span-2'>
					<MultiTextField
						label={label}
						compact
						placeholder='String Value'
						values={data.defaultValue || []}
						onChange={newValues => {
							onChange(newValues.length === 0 ? undefined : newValues);
						}}
					/>
				</div>
			);

		case 'multi-select-input':
			return (
				<div className='col-span-2'>
					<MultiSelectField
						label={label}
						compact
						values={data.defaultValue || []}
						options={options.map(option => {
							return {
								label: i18nStringTransform(option.label),
								value: option.value,
							};
						})}
						onChange={newValues => {
							onChange(newValues.length === 0 ? undefined : newValues);
						}}
					/>
				</div>
			);

		default:
			return null;
	}
}
