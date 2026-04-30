import TextField from '@/components/input_fields/TextField';
import { useDialog } from '@/contexts/dialog/useDialog';
import { usePageContext } from '@/contexts/pages/usePageContext';
import PlusSvg from '@@/svg/PlusSvg';
import { useState } from 'react';
import type { CreateTileContext } from '.';
import DialogConfirmButton from '../DialogButton/DialogConfirmButton';

export default function CreateFolderPage() {
	const { onCreateFolder } = usePageContext<CreateTileContext>();
	const { closeDialog } = useDialog();
	const [value, setValue] = useState('');
	const trimmedValue = value.trim();

	return (
		<div className='flex flex-col gap-6'>
			<TextField
				label='Folder Name'
				placeholder='New Folder'
				value={value}
				onChange={setValue}
			/>

			<div className='flex justify-end'>
				<DialogConfirmButton
					disabled={!trimmedValue}
					icon={<PlusSvg className='size-4.5' />}
					onClick={() => {
						if (trimmedValue) {
							onCreateFolder(trimmedValue);
							closeDialog();
						}
					}}
				>
					Create
				</DialogConfirmButton>
			</div>
		</div>
	);
}
