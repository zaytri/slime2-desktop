import DropdownField from '@/components/input_fields/DropdownField';
import NumberField from '@/components/input_fields/NumberField';
import SelectField from '@/components/input_fields/SelectField';
import TextAreaField from '@/components/input_fields/TextAreaField';
import TextField from '@/components/input_fields/TextField';
import { useDialog } from '@/contexts/dialog/useDialog';
import { i18nStringTransform } from '@/helpers/i18n';
import {
	SECTION_SETTING_GROUPED_OPTIONS,
	SETTINGS_DATA,
	type WidgetSetting,
} from '@@/json/widgetSettings';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';
import ConditionField from './ConditionField';
import DefaultValueField from './DefaultValueField';
import OptionsField from './OptionsField';
import StepField from './StepField';
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
	conditionIds: string[];
	onSave: (id: string, label: string, data: SettingData) => void;
};

export default function EditWidgetSettingDialog({
	id,
	label,
	data,
	idExists,
	conditionIds,
	onSave,
}: EditWidgetSettingDialogProps) {
	const { closeDialog } = useDialog();
	const [newId, setNewId] = useState<string>(id || '');
	const [idError, setIdError] = useState('');
	const [newLabel, setNewLabel] = useState<string>(label || '');
	const [newData, setNewData] = useState<SettingData>(data);

	const trimmedId = newId.trim();
	const trimmedLabel = newLabel.trim();
	const emptyOptions = 'options' in newData && newData.options.length === 0;
	let duplicateOptionLabels = false;
	if ('options' in newData) {
		const labelSet = new Set<string>();
		duplicateOptionLabels = newData.options.some(option => {
			const label = i18nStringTransform(option.label);
			if (labelSet.has(label)) {
				return true;
			} else {
				labelSet.add(label);
			}
		});
	}

	const disableSave =
		!trimmedId ||
		!trimmedLabel ||
		!!idError ||
		emptyOptions ||
		duplicateOptionLabels;

	function onChangeId(id: string) {
		setNewId(id);
		setIdError('');
	}

	return (
		<DialogContent className='flex w-160 flex-col justify-between overflow-hidden'>
			<div className='flex flex-col gap-2 overflow-y-auto p-4'>
				<div className='grid flex-1 grid-cols-2 items-start gap-x-4 gap-y-2'>
					{newData.type === 'text-display' ? (
						<div className='col-span-2'>
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
							const defaultClone = structuredClone(
								SETTINGS_DATA[newType].defaultData,
							);
							// don't lose options
							// when switching to another type with options
							if ('options' in newData && 'options' in defaultClone) {
								defaultClone.options = newData.options;
							}

							// don't lose default
							// when switching between select and dropdown
							if (
								(newData.type === 'select-input' ||
									newData.type === 'dropdown-input') &&
								(defaultClone.type === 'select-input' ||
									defaultClone.type === 'dropdown-input')
							) {
								defaultClone.defaultValue =
									newData.defaultValue ?? defaultClone.defaultValue;
							}

							// don't lose default
							// when switching between text and text area
							if (
								(newData.type === 'text-input' ||
									newData.type === 'text-area-input') &&
								(defaultClone.type === 'text-input' ||
									defaultClone.type === 'text-area-input')
							) {
								defaultClone.defaultValue =
									newData.defaultValue ?? defaultClone.defaultValue;
							}

							// don't lose min/max/step/default
							// when switching between number and slider
							if (
								(newData.type === 'number-input' ||
									newData.type === 'slider-input') &&
								(defaultClone.type === 'number-input' ||
									defaultClone.type === 'slider-input')
							) {
								defaultClone.min = newData.min ?? defaultClone.min;
								defaultClone.max = newData.max ?? defaultClone.max;
								defaultClone.step = newData.step ?? defaultClone.step;
								defaultClone.defaultValue =
									newData.defaultValue ?? defaultClone.defaultValue;
							}

							// don't lose description when switching to most other types
							if (
								newData.type !== 'button' &&
								newData.type !== 'text-display' &&
								newData.type !== 'image-display' &&
								defaultClone.type !== 'button' &&
								defaultClone.type !== 'text-display' &&
								defaultClone.type !== 'image-display'
							) {
								defaultClone.description =
									newData.description ?? defaultClone.description;
							}

							setNewData({
								// don't lose globals when switching to another type
								condition: newData.condition,
								halfSpan: newData.halfSpan,
								searchTags: newData.searchTags,
								...defaultClone,
							});
						}}
						options={[...SECTION_SETTING_GROUPED_OPTIONS]}
					/>

					<SelectField
						label='Half Span'
						compact
						value={newData.halfSpan ?? false}
						onChange={value => {
							setNewData({
								...newData,
								halfSpan: value || undefined,
							});
						}}
						options={[
							{ label: 'True', value: true },
							{ label: 'False', value: false },
						]}
					/>

					{(newData.type === 'text-input' ||
						newData.type === 'text-area-input' ||
						newData.type === 'multi-text-input' ||
						newData.type === 'number-input' ||
						newData.type === 'dropdown-input' ||
						newData.type === 'color-input' ||
						newData.type === 'font-input') && (
						<div className='col-span-2'>
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
						</div>
					)}

					{(newData.type === 'dropdown-input' ||
						newData.type === 'select-input' ||
						newData.type === 'multi-select-input') && (
						<OptionsField
							values={newData.options}
							onChange={newValues => {
								if (newData.type === 'multi-select-input') {
									setNewData({
										...newData,
										options: newValues,
										defaultValue: newData.defaultValue ?? [],
									});
								} else {
									const optionWithExistingDefaultValue = newValues.find(
										option => {
											return option.value === newData.defaultValue;
										},
									);

									setNewData({
										...newData,
										options: newValues,
										defaultValue:
											optionWithExistingDefaultValue?.value ??
											newValues[0]?.value,
									});
								}
							}}
						/>
					)}

					{newData.type !== 'button' &&
						newData.type !== 'text-display' &&
						newData.type !== 'image-display' &&
						newData.type !== 'image-input' &&
						newData.type !== 'audio-input' &&
						newData.type !== 'video-input' &&
						newData.type !== 'multi-image-input' &&
						newData.type !== 'multi-audio-input' &&
						newData.type !== 'multi-video-input' && (
							<div className='col-span-2'>
								<DefaultValueField
									data={newData}
									options={'options' in newData ? newData.options : undefined}
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
							</div>
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

					{newData.type !== 'button' &&
						newData.type !== 'text-display' &&
						newData.type !== 'image-display' && (
							<div className='col-span-2 shrink-0'>
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

					<ConditionField
						value={newData.condition}
						ids={conditionIds}
						onChange={newValue => {
							setNewData({
								...newData,
								condition: newValue,
							});
						}}
					/>
				</div>
			</div>

			<div className='flex items-center gap-4 border-t border-zinc-800 p-4'>
				<div className='flex-1'>
					{disableSave && (
						<p className='text-3.5 font-bold text-zinc-500 italic'>
							{'options' in newData
								? duplicateOptionLabels
									? 'Duplicate Option Labels are not allowed.'
									: 'Label, Unique ID, and at least one Option are required.'
								: 'Label and Unique ID are required.'}
						</p>
					)}
				</div>
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

						const copiedData = structuredClone(newData);

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

						if (
							'options' in copiedData &&
							copiedData.defaultValue === undefined
						) {
							if (copiedData.type === 'multi-select-input') {
								copiedData.defaultValue = [];
							} else if (copiedData.options.length > 0) {
								copiedData.defaultValue = copiedData.options[0]?.value;
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
