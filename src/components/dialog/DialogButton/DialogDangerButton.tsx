import TrashSvg from '@/components/svg/TrashSvg';
import DialogActionButton from './DialogActionButton';

type DialogDangerButtonProps = {
	onClick: VoidFunction;
	disabled?: boolean;
};

export default function DialogDangerButton({
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
			<p>{children}</p>
		</DialogActionButton>
	);
}
