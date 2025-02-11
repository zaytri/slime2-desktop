import { lazy, memo, Suspense, useRef, useState } from 'react';
import Dialog from './components/Dialog';
import { DialogContext, type DialogType } from './useDialog';

export default memo(function DialogProvider({ children }: Props.WithChildren) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [{ name, payload }, setDialog] = useState<DialogType>({
		name: '',
		payload: null,
	});

	function close() {
		dialogRef.current?.close();
	}

	function open(dialog: DialogType) {
		close();
		setDialog(dialog);
		dialogRef.current?.showModal();
	}

	const LazyComponent = lazy(() => import(`./components/${name}Dialog.tsx`));

	return (
		<DialogContext value={{ name, payload, open, close }}>
			{children}

			<dialog
				className='relative h-full max-h-none w-full max-w-none bg-transparent backdrop:rounded-[5rem] backdrop:bg-black/25 backdrop:shadow-[inset_0_0_200px_50px] backdrop:shadow-black/50 backdrop:backdrop-blur-[2px]'
				ref={dialogRef}
			>
				<Dialog>
					<Suspense fallback={null}>{name && <LazyComponent />}</Suspense>
				</Dialog>
			</dialog>
		</DialogContext>
	);
});
