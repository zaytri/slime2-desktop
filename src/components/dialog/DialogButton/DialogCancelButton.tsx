import { useDialog } from '@/contexts/dialog/useDialog';
import DialogActionButton from './DialogActionButton';

type DialogCancelButtonProps = {
	actionText?: string;
};

export default function DialogCancelButton({
	actionText,
}: DialogCancelButtonProps) {
	const { closeDialog } = useDialog();

	return (
		<DialogActionButton
			onClick={() => {
				closeDialog();
			}}
			className='border-zinc-100 bg-zinc-200 from-zinc-200 to-zinc-300 text-zinc-700 outline-zinc-400 over:bg-lime-200 over:text-lime-800 over:outline-lime-600'
		>
			<p>{actionText || 'Cancel'}</p>
		</DialogActionButton>
	);
}
