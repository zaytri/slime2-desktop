import { useDialog } from '@/contexts/dialog/useDialog';
import { useState } from 'react';
import TextField from '../../input_fields/TextField';
import DialogCancelButton from '../DialogButton/DialogCancelButton';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';
import DialogContent from '../DialogContent';
import UniqueIdField from './UniqueIdField';

type EditWidgetCategoryDialogProps = {
	id?: string;
	label?: string;
	onSave: (id: string, label: string) => void;
	idExists: (id: string) => boolean;
};

export default function EditWidgetCategoryDialog({
	id,
	label,
	idExists,
	onSave,
}: EditWidgetCategoryDialogProps) {
	const { closeDialog } = useDialog();
	const [newId, setNewId] = useState<string>(id || '');
	const [idError, setIdError] = useState('');
	const [newLabel, setNewLabel] = useState<string>(label || '');

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
						placeholder='My Category'
						value={newLabel}
						onChange={setNewLabel}
					/>

					<UniqueIdField value={newId} onChange={onChangeId} error={idError} />
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

						onSave(trimmedId, trimmedLabel);
						closeDialog();
					}}
				>
					{!id ? 'Add' : 'Update'}
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
