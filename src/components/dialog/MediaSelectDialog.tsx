import { useDialog } from '@/contexts/dialog/useDialog';
import { tempCopy } from '@/helpers/commands';
import { getTempFileSrc } from '@/helpers/media';
import {
	getMediaFormats,
	MediaType,
	openAudio,
	openImage,
	openVideo,
} from '@/helpers/openFile';
import { capitalizeWord } from '@/helpers/string';
import clsx from 'clsx';
import { memo, useRef, useState } from 'react';
import MediaIcon from '../MediaIcon';
import MediaInputPreview from '../MediaInputPreview';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogContent from './DialogContent';

type MediaSelectDialogProps = {
	type: MediaType;
	onSave: (value: string) => void;
};

const MediaSelectDialog = memo(function MediaSelectDialog({
	type,
	onSave,
}: MediaSelectDialogProps) {
	const { closeDialog } = useDialog();
	const imageDialogButtonRef = useRef<HTMLButtonElement>(null);
	const [value, setValue] = useState<string | undefined>(undefined);

	const capitalType = capitalizeWord(type);

	return (
		<DialogContent className='flex flex-col justify-between gap-4 p-4'>
			<div className='flex flex-col gap-4'>
				{value && (
					<div
						className={clsx(
							'flex items-center justify-center overflow-hidden rounded-1 border border-white bg-alpha-checkerboard outline outline-zinc-400 has-focus-visible:outline-2 has-focus-visible:outline-black',
							type === 'image' && 'p-1',
							type === 'audio' &&
								'overflow-visible border-none bg-none outline-none',
						)}
					>
						<MediaInputPreview
							type={type}
							src={getTempFileSrc(value)}
							className='max-h-80 min-h-24'
						/>
					</div>
				)}

				<div className='flex flex-col gap-2'>
					<button
						type='button'
						className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-2 text-4.5 font-bold text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
						ref={imageDialogButtonRef}
						onClick={async () => {
							let filePath = null;
							switch (type) {
								case 'image':
									filePath = await openImage();
									break;
								case 'video':
									filePath = await openVideo();
									break;
								case 'audio':
									filePath = await openAudio();
									break;
							}
							if (!filePath) return;

							// create new temp copy
							const fileName = await tempCopy(filePath);

							setValue(fileName);
						}}
					>
						<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
						<div className='relative flex flex-1 items-center justify-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
							<MediaIcon type={type} className='size-5' />
							<p>
								Select <span>{capitalType}</span>
							</p>
						</div>
					</button>

					<p className='text-3.5 text-zinc-500'>
						Allowed file types: {getMediaFormats(type).join(', ')}
					</p>
				</div>
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
});

export default MediaSelectDialog;
