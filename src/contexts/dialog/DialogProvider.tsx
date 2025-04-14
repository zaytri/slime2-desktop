import Dialog from '@/components/dialog/Dialog';
import { lazy, memo, Suspense, useRef, useState } from 'react';
import { DialogType } from './DialogType';
import { DialogContext } from './useDialog';

const dialogComponentsFolderPath = '../../components/dialog';

const DialogProvider = memo(function DialogProvider({
	children,
}: Props.WithChildren) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [{ name, payload, onCancel }, setDialog] = useState<DialogType>({
		name: '',
		payload: null,
	});

	function close() {
		dialogRef.current?.close();
		setDialog({ name: '', payload: null });
	}

	function open(dialog: DialogType) {
		close();
		setDialog(dialog);
		dialogRef.current?.showModal();
	}

	const LazyComponent = lazy(
		() => import(`${dialogComponentsFolderPath}/${name}Dialog.tsx`),
	);

	return (
		<DialogContext
			value={{ name, payload, open, close, onCancel: onCancel ?? close }}
		>
			{children}

			<dialog
				className='relative h-full max-h-none w-full max-w-none bg-transparent backdrop:rounded-[5rem] backdrop:bg-black/25 backdrop:shadow-[inset_0_0_200px_50px] backdrop:shadow-black/50 backdrop:backdrop-blur-[2px]'
				ref={dialogRef}
			>
				<Suspense fallback={null}>
					<Dialog>{name && <LazyComponent />}</Dialog>
				</Suspense>
			</dialog>
		</DialogContext>
	);
});

export default DialogProvider;
