import DropdownField from '@/components/input_fields/DropdownField';
import TextField from '@/components/input_fields/TextField';
import { useDialog } from '@/contexts/dialog/useDialog';
import { swapItems } from '@/helpers/array';
import { SECTION_OPTIONS, type WidgetSetting } from '@@/json/widgetSettings';
import ArrowDownSvg from '@@/svg/ArrowDownSvg';
import ArrowUpSvg from '@@/svg/ArrowUpSvg';
import PlusSvg from '@@/svg/PlusSvg';
import XSvg from '@@/svg/XSvg';
import { Fieldset, Legend } from '@headlessui/react';
import { useState } from 'react';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';
import UniqueIdField from './UniqueIdField';

type EditWidgetSectionDialogProps = {
	id?: string;
	label?: string;
	type: WidgetSetting.AnySection['type'];
	condition?: WidgetSetting.Condition;
	searchTags?: WidgetSetting.SearchTags;
	previews?: WidgetSetting.MultiSection['previews'];
	previewIds?: string[];
	onSave: (
		id: string,
		label: string,
		type: WidgetSetting.AnySection['type'],
		condition: WidgetSetting.Condition,
		searchTags: WidgetSetting.SearchTags,
		previews: WidgetSetting.MultiSection['previews'],
	) => void;
	idExists: (id: string) => boolean;
};

export default function EditWidgetSectionDialog({
	id,
	label,
	type,
	condition,
	searchTags,
	previews,
	previewIds,
	onSave,
	idExists,
}: EditWidgetSectionDialogProps) {
	const { closeDialog } = useDialog();
	const [newId, setNewId] = useState<string>(id || '');
	const [idError, setIdError] = useState('');
	const [newLabel, setNewLabel] = useState<string>(label || '');
	const [newType, setNewType] = useState(type);
	const [newPreviews, setNewPreviews] = useState<string[]>(previews ?? []);

	const trimmedId = newId.trim();
	const trimmedLabel = newLabel.trim();
	const disableSave = !trimmedId || !trimmedLabel || !!idError;

	function onChangeId(id: string) {
		setNewId(id);
		setIdError('');
	}

	return (
		<DialogContent className='flex max-h-160 w-160 flex-col justify-between overflow-hidden'>
			<div className='flex flex-col gap-2 overflow-y-auto p-4'>
				<div className='grid flex-1 grid-cols-2 items-start gap-x-4 gap-y-2'>
					<TextField
						label='Label'
						compact
						placeholder='My Section'
						value={newLabel}
						onChange={setNewLabel}
					/>

					<UniqueIdField value={newId} onChange={onChangeId} error={idError} />

					<DropdownField
						label='Type'
						compact
						value={newType}
						onChange={setNewType}
						options={SECTION_OPTIONS}
					/>

					{newType === 'multi-section' && (
						<PreviewsField
							values={newPreviews}
							onChange={setNewPreviews}
							previewIds={previewIds ?? []}
						/>
					)}
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

						onSave(
							trimmedId,
							trimmedLabel,
							newType,
							condition,
							searchTags,
							newPreviews,
						);
						closeDialog();
					}}
				>
					{!id ? 'Add' : 'Update'}
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}

type PreviewsFieldProps = {
	values: string[];
	onChange: (values: string[]) => void;
	previewIds: string[];
};

function PreviewsField({ values, onChange, previewIds }: PreviewsFieldProps) {
	const availableIds = previewIds.filter(id => {
		return !values.includes(id);
	});
	const [newValue, setNewValue] = useState(availableIds[0]);

	function addValue() {
		if (newValue) {
			onChange([...values, newValue]);
		}
	}

	function removeValueAtIndex(index: number) {
		const newValues = structuredClone(values);
		newValues.splice(index, 1);
		onChange(newValues);
	}

	function swapValueIndex(oldIndex: number, newIndex: number) {
		const newValues = structuredClone(values);
		onChange(swapItems(newValues, oldIndex, newIndex));
	}

	return (
		<div className='col-span-2 flex flex-col gap-2'>
			<Fieldset className='relative flex gap-2'>
				<div className='absolute inset-0 flex items-center'>
					<div className='h-5 flex-1 border border-zinc-500 bg-zinc-300'></div>
				</div>

				<Legend
					as='div'
					className='relative flex items-center self-start rounded-1 bg-zinc-700 px-2 py-0.5 font-extrabold whitespace-nowrap text-white outline -outline-offset-1 outline-zinc-800'
				>
					<p>Previews</p>
				</Legend>

				<div className='flex-1'>
					<DropdownField
						label='Setting ID'
						compact
						value={newValue}
						onChange={setNewValue}
						options={previewIds.map(id => {
							return { label: id, value: id };
						})}
					/>
				</div>

				<button
					type='button'
					className='z-5 flex items-center justify-center gap-1 rounded-1 bg-zinc-700 px-2 text-3.5 font-bold text-white outline outline-zinc-800 disabled:bg-zinc-400 disabled:outline-zinc-500 over:bg-green-800 over:outline-3 over:outline-offset-0! over:outline-lime-600'
					onClick={addValue}
					disabled={!newValue}
				>
					<PlusSvg className='size-2.5' />
					<p>Add</p>
				</button>
			</Fieldset>

			{values.length > 0 && (
				<div className='flex flex-col gap-1.5'>
					{values.map((id, index) => {
						const canSwapUp = index > 0;
						const canSwapDown = index < values.length - 1;

						return (
							<div key={id} className='flex gap-1'>
								<button
									disabled={!canSwapUp}
									type='button'
									className='rounded-1 px-1.5 text-zinc-800 disabled:text-zinc-400 over:bg-lime-600 over:text-white over:outline over:outline-offset-0! over:outline-lime-700'
									onClick={() => {
										if (canSwapUp) swapValueIndex(index, index - 1);
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
										if (canSwapDown) swapValueIndex(index, index + 1);
									}}
								>
									<span className='sr-only'>Move Down</span>
									<ArrowDownSvg className='size-3.5' />
								</button>

								<div className='flex flex-1 rounded-1 bg-zinc-700 text-3.5 outline -outline-offset-1 outline-zinc-800'>
									<div className='flex flex-1 items-center'>
										<p className='px-2 py-0.5 font-bold text-white'>ID</p>
										<p className='flex flex-1 items-center self-stretch bg-white/75 px-1 font-mono font-bold'>
											{id}
										</p>
									</div>
								</div>

								<button
									type='button'
									className='rounded-1 px-1.5 text-zinc-800 over:bg-rose-800 over:text-white over:outline over:outline-offset-0! over:outline-rose-900'
									onClick={() => {
										removeValueAtIndex(index);
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
