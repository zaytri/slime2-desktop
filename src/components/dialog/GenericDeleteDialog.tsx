import { useDialog } from '@/contexts/dialog/useDialog';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogDangerButton from './DialogButton/DialogDangerButton';
import DialogContent from './DialogContent';

type GenericDeleteDialogProps = {
	onDelete: VoidFunction;
	actionText?: string;
	disabled?: boolean;
};

export default function GenericDeleteDialog({
	onDelete,
	actionText,
	children,
	disabled,
}: Props.WithChildren<GenericDeleteDialogProps>) {
	const { closeDialog } = useDialog();

	return (
		<DialogContent className='flex w-96 flex-col justify-between gap-6 p-4 text-4.5'>
			<div className='flex-1'>{children}</div>
			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogDangerButton
					disabled={disabled}
					onClick={() => {
						if (!disabled) {
							onDelete();
							closeDialog();
						}
					}}
				>
					{actionText || 'Delete'}
				</DialogDangerButton>
			</div>
		</DialogContent>
	);
}
