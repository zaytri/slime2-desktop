import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogContent from './DialogContent';

export default function GenericErrorDialog({ children }: Props.WithChildren) {
	return (
		<DialogContent className='flex w-96 flex-col justify-between gap-6 p-4 text-4.5'>
			<div className='flex-1'>{children}</div>
			<div className='flex justify-end gap-4'>
				<DialogCancelButton actionText='Close' />
			</div>
		</DialogContent>
	);
}
