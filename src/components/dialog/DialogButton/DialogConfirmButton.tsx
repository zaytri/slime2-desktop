import CheckSvg from '@/components/svg/CheckSvg';
import clsx from 'clsx';
import DialogActionButton from './DialogActionButton';

type DialogConfirmButtonProps = {
	onClick: VoidFunction;
	disabled?: boolean;
	icon?: React.ReactNode;
};

export default function DialogConfirmButton({
	onClick,
	disabled,
	children,
	icon,
	className,
}: Props.WithClassNameAndChildren<DialogConfirmButtonProps>) {
	return (
		<DialogActionButton
			disabled={disabled}
			onClick={() => {
				if (!disabled) {
					onClick();
				}
			}}
			className={clsx(
				'border-lime-100 bg-lime-200 from-lime-200 to-lime-300 text-green-900 outline-lime-600 over:bg-lime-200 over:outline-lime-600',
				className,
			)}
		>
			{icon || <CheckSvg className='size-4.5' />}
			<p>{children}</p>
		</DialogActionButton>
	);
}
