import TrashSvg from '@/components/svg/TrashSvg';
import { memo } from 'react';
import DialogActionButton from './DialogActionButton';

type DialogDangerButtonProps = {
	onClick: VoidFunction;
	disabled?: boolean;
};

const DialogDangerButton = memo(function DialogDangerButton({
	onClick,
	children,
	disabled,
}: Props.WithChildren<DialogDangerButtonProps>) {
	return (
		<DialogActionButton
			onClick={onClick}
			disabled={disabled}
			className='border-rose-100 bg-rose-200 from-rose-200 to-rose-300 text-rose-900 outline-rose-700 over:outline-rose-700'
		>
			<TrashSvg className='size-4.5' />
			<p className='-mb-0.5'>{children}</p>
		</DialogActionButton>
	);
});

export default DialogDangerButton;
