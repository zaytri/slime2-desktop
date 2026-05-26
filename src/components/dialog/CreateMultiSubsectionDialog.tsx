import { useDialog } from '@/contexts/dialog/useDialog';
import { useState } from 'react';
import TextField from '../input_fields/TextField';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogContent from './DialogContent';

type CreateMultiSubsectionDialogProps = {
	multiSectionName: string;
	onCreate: (name: string) => void;
};

export default function CreateMultiSubsectionDialog({
	multiSectionName,
	onCreate,
}: CreateMultiSubsectionDialogProps) {
	const placeholder = `New ${multiSectionName} Item`;
	const [name, setName] = useState('');
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
						onCreate(name.trim() || placeholder);
						closeDialog();
					}}
				>
					Create
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
