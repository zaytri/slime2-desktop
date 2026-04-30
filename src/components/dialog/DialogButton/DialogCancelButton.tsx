import { useDialog } from '@/contexts/dialog/useDialog';
import { memo } from 'react';
import DialogActionButton from './DialogActionButton';

const DialogCancelButton = memo(function DialogCancelButton() {
	const { closeDialog } = useDialog();

	return (
		<DialogActionButton
			onClick={() => {
				closeDialog();
			}}
			className='border-zinc-100 bg-zinc-200 from-zinc-200 to-zinc-300 text-zinc-700 outline-zinc-400 over:bg-lime-200 over:text-lime-800 over:outline-lime-600'
		>
			<p className='-mb-0.5'>Cancel</p>
		</DialogActionButton>
	);
});

export default DialogCancelButton;
