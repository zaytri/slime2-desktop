import { useDialog } from '@/contexts/dialog/useDialog';
import { memo } from 'react';
import DialogHeader from './DialogHeader';

type ErrorDialogProps = {
	title: string;
	description: string;
};

const ErrorDialog = memo(function ErrorDialog({
	title,
	description,
}: ErrorDialogProps) {
	const { closeDialog } = useDialog();

	return (
		<div className='max-w-96'>
			<DialogHeader>{title}</DialogHeader>
			<div className='flex flex-col gap-8'>
				<p className='text-lg'>{description}</p>
				<button
					type='button'
					className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
					onClick={closeDialog}
				>
					Ok
				</button>
			</div>
		</div>
	);
});

export default ErrorDialog;
