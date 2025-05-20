import Dialog from '@/components/dialog/Dialog';
import { memo, useRef, useState } from 'react';
import { DialogContext } from './useDialog';

const DialogProvider = memo(function DialogProvider({
	children,
}: Props.WithChildren) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [component, setComponent] = useState<React.ReactNode>(null);
	const [onCancel, setOnCancel] = useState<VoidFunction>();

	function closeDialog() {
		setComponent(null);
		setOnCancel(undefined);
		dialogRef.current?.close();
	}

	function openDialog(component: React.ReactNode, onCancel?: VoidFunction) {
		closeDialog();
		setComponent(component);
		setOnCancel(onCancel);
		dialogRef.current?.showModal();
	}

	return (
		<DialogContext
			value={{
				component,
				openDialog,
				closeDialog,
				onCancel: onCancel ?? closeDialog,
			}}
		>
			{children}

			<dialog
				className='relative h-full max-h-none w-full max-w-none bg-transparent backdrop:rounded-[5rem] backdrop:bg-black/25 backdrop:shadow-[inset_0_0_200px_50px] backdrop:shadow-black/50 backdrop:backdrop-blur-[2px]'
				ref={dialogRef}
			>
				<Dialog>{component}</Dialog>
			</dialog>
		</DialogContext>
	);
});

export default DialogProvider;
