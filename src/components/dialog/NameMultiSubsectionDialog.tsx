import { useDialog } from '@/contexts/dialog/useDialog';
import { useState } from 'react';
import TextField from '../input_fields/TextField';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogContent from './DialogContent';

type NameMultiSubsectionDialogProps = {
	multiSectionName: string;
	onSave: (name: string) => void;
	value?: string;
};

export default function NameMultiSubsectionDialog({
	multiSectionName,
	onSave,
	value,
}: NameMultiSubsectionDialogProps) {
	const placeholder = `${multiSectionName} Item`;
	const [name, setName] = useState(value ?? '');
	const { closeDialog } = useDialog();

	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<div className='flex flex-col gap-2'>
				<TextField
					label='Item Name'
					value={name}
					onChange={setName}
					placeholder={placeholder}
				/>
			</div>
			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					onClick={() => {
						onSave(name.trim() || placeholder);
						closeDialog();
					}}
				>
					{value ? 'Save' : 'Create'}
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
