import DropdownField from '@/components/input_fields/DropdownField';
import NumberField from '@/components/input_fields/NumberField';
import TextAreaField from '@/components/input_fields/TextAreaField';
import TextField from '@/components/input_fields/TextField';
import { deepCopyObject } from '@/contexts/common';
import { useDialog } from '@/contexts/dialog/useDialog';
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
							setNewData(SETTINGS_DATA[newType].defaultData);
						}}
						options={SECTION_SETTING_GROUPED_OPTIONS}
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
