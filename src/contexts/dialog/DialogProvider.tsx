import Dialog from '@/components/dialog/Dialog';
import { Dialog as AriakitDialog, useDialogStore } from '@ariakit/react';
import clsx from 'clsx';
import { useState } from 'react';
import { useSettings } from '../settings/useSettings';
import { DialogContext } from './useDialog';

export default function DialogProvider({ children }: Props.WithChildren) {
	const [component, setComponent] = useState<React.ReactNode>(null);
	const [onCancel, setOnCancel] = useState<VoidFunction>();
	const [onBack, setOnBack] = useState<VoidFunction>();
	const [title, setTitle] = useState<string>('Missing Title!');
	const { settings } = useSettings();
	const dialogStore = useDialogStore();

	function closeDialog() {
		setComponent(null);
		setOnCancel(undefined);
		setOnBack(undefined);
		dialogStore.hide();
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
		dialogStore.show();
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

			<AriakitDialog
				store={dialogStore}
				className={clsx(
					'fixed inset-0 z-100 flex items-center justify-center bg-transparent',
					settings.disableAnimations && 'disable-animations',
				)}
				backdrop={
					<div className='bg-black/25 shadow-[inset_0_0_200px_50px] shadow-black/50 backdrop-blur-[3px]' />
				}
			>
				<Dialog>{component}</Dialog>
			</AriakitDialog>
		</DialogContext>
	);
}
