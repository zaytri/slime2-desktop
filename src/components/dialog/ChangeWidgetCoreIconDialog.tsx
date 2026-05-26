import { useDialog } from '@/contexts/dialog/useDialog';
import { tempCopy } from '@/helpers/commands';
import { getTempFileSrc } from '@/helpers/media';
import { openImage } from '@/helpers/openFile';
import { useRef, useState } from 'react';
import MediaIcon from '../MediaIcon';
import MediaPreview from '../MediaPreview';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogContent from './DialogContent';

type ChangeWidgetCoreIconDialogProps = {
	onSave: (value: string) => void;
};

export default function ChangeWidgetCoreIconDialog({
	onSave,
}: ChangeWidgetCoreIconDialogProps) {
	const { closeDialog } = useDialog();
	const imageDialogButtonRef = useRef<HTMLButtonElement>(null);
	const [value, setValue] = useState<string | undefined>(undefined);

	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<div className='flex gap-6'>
				<div className='flex flex-1 flex-col gap-4 self-center'>
					<div className='flex flex-col gap-2'>
						<button
							type='button'
							className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-2 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
							ref={imageDialogButtonRef}
							onClick={async () => {
								const filePath = await openImage([
									{
										name: 'PNG Image',
										extensions: ['png'],
									},
								]);

								if (!filePath) return;

								// create new temp copy
								const fileName = await tempCopy(filePath);

								setValue(fileName);
							}}
						>
							<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
							<div className='relative flex flex-1 items-center justify-center gap-3 drop-shadow-[0_1px_3px_#FFFB]'>
								<MediaIcon type='image' className='h-5' />
								<p>Select PNG Image</p>
							</div>
						</button>

						<div className='flex flex-col text-3.5 font-medium text-zinc-500'>
							<p>Allowed file types: PNG</p>
						</div>
					</div>
				</div>

				{value && (
					<div className='flex items-center justify-center overflow-hidden rounded-1 border border-white bg-alpha-checkerboard p-1 outline outline-zinc-400 has-focus-visible:outline-2 has-focus-visible:outline-black'>
						<MediaPreview
							type='image'
							src={getTempFileSrc(value)}
							className='max-h-80 min-h-24 max-w-80'
						/>
					</div>
				)}
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					onClick={() => {
						if (value) onSave(value);
						closeDialog();
					}}
					disabled={!value}
				>
					Save
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
