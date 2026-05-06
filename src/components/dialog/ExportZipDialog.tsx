import { useDialog } from '@/contexts/dialog/useDialog';
import { packageCustomWidget } from '@/helpers/commands';
import { saveZip } from '@/helpers/saveFile';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogContent from './DialogContent';

type ExportZipDialogProps = {
	widgetId: string;
};

export default function ExportZipDialog({ widgetId }: ExportZipDialogProps) {
	const { closeDialog } = useDialog();

	return (
		<DialogContent className='flex w-96 flex-col justify-between gap-6 p-4'>
			<div className='flex flex-col gap-2'>
				<p className='font-medium'>
					Packages your widget into a ZIP file for others to import as a custom
					widget.
				</p>
				<p className='rounded-2 border-2 border-zinc-500 bg-white p-2 text-3.5 text-zinc-600'>
					<strong>Note:</strong> Your widget settings values here will{' '}
					<strong>NOT</strong> be used, only their default values will be
					packaged.
				</p>
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					onClick={async () => {
						const zipPath = await saveZip();
						if (!zipPath) return;

						try {
							await packageCustomWidget(widgetId, zipPath);
							await revealItemInDir(zipPath);
						} catch (error) {
							console.error(error);
						}

						closeDialog();
					}}
				>
					Export
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
