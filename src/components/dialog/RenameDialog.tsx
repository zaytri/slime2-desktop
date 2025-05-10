import { RenamePayload } from '@/contexts/dialog/DialogType';
import { useDialog } from '@/contexts/dialog/useDialog';
import { Field, Input, Label } from '@headlessui/react';
import { memo, useState } from 'react';
import DialogHeader from './DialogHeader';

const RenameDialog = memo(function RenameDialog() {
	const {
		payload: { value, onSave },
		close,
	} = useDialog<RenamePayload>();
	const [inputValue, setInputValue] = useState(value ?? 'New');

	return (
		<>
			<DialogHeader>{value ? 'Rename' : 'Add New'}</DialogHeader>

			<div className='flex flex-col gap-4'>
				<Field>
					<div className='input-wrapper flex-col'>
						<Label className='input-label'>Name</Label>
						<Input
							autoFocus
							value={inputValue}
							autoComplete='off'
							aria-autocomplete='none'
							className='input-class'
							onChange={event => {
								setInputValue(event.target.value);
							}}
						/>
					</div>
				</Field>

				<button
					type='button'
					className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
					onClick={async () => {
						onSave(inputValue || value || 'New');

						close();
					}}
				>
					Save
				</button>
			</div>
		</>
	);
});

export default RenameDialog;
