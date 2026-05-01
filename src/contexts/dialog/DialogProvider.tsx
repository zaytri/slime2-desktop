import Dialog from '@/components/dialog/Dialog';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { useSettings } from '../settings/useSettings';
import { DialogContext } from './useDialog';

export default function DialogProvider({ children }: Props.WithChildren) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [component, setComponent] = useState<React.ReactNode>(null);
	const [onCancel, setOnCancel] = useState<VoidFunction>();
	const [onBack, setOnBack] = useState<VoidFunction>();
	const [title, setTitle] = useState<string>('Missing Title!');
	const { settings } = useSettings();

	function closeDialog() {
		setComponent(null);
		setOnCancel(undefined);
		dialogRef.current?.close();
	}

	function openDialog(
		title: string,
		component: React.ReactNode,
		onCancel?: VoidFunction,
	) {
		setTitle(title);
		closeDialog();
		setComponent(component);
		setOnCancel(() => onCancel);
		dialogRef.current?.showModal();
	}

	return (
		<DialogContext
			value={{
				component,
				openDialog,
				closeDialog,
				onCancel: onCancel ?? closeDialog,
				title,
				setTitle,
				onBack,
				setOnBack: (onBack?: VoidFunction) => {
					setOnBack(() => onBack);
				},
			}}
		>
			{children}

			<dialog
				className={clsx(
					'relative h-full max-h-none w-full max-w-none bg-transparent backdrop:bg-black/25 backdrop:shadow-[inset_0_0_200px_50px] backdrop:shadow-black/50 backdrop:backdrop-blur-[3px]',
					settings.disableAnimations && 'disable-animations',
				)}
				ref={dialogRef}
			>
				<Dialog>{component}</Dialog>
			</dialog>
		</DialogContext>
	);
}
