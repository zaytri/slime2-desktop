import { useDialog } from '@/contexts/dialog/useDialog';
import { tempCopy } from '@/helpers/commands';
import {
	createWidgetMediaGalleryValue,
	getTempFileSrc,
	getWidgetMediaGallerySrc,
	MEDIA_GALLERY_PREFIX,
	mediaFolderPath,
} from '@/helpers/media';
import {
	getMediaFormats,
	type MediaType,
	openAudio,
	openImage,
	openVideo,
} from '@/helpers/openFile';
import { capitalizeWord } from '@/helpers/string';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import TextField from '../input_fields/TextField';
import ToggleField from '../input_fields/ToggleField';
import MediaIcon from '../MediaIcon';
import MediaPreview from '../MediaPreview';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogContent from './DialogContent';

type MediaSelectDialogProps = {
	type: MediaType;
	onSave: (value: string) => void;
};

export default function MediaSelectDialog({
	type,
	onSave,
}: MediaSelectDialogProps) {
	const { closeDialog } = useDialog();
	const imageDialogButtonRef = useRef<HTMLButtonElement>(null);
	const [value, setValue] = useState<string | undefined>(undefined);
	const [urlMode, setUrlMode] = useState(false);
	const [url, setUrl] = useState('');

	const mediaPath = urlMode ? url.trim() : value;
	const capitalType = capitalizeWord(type);

	return (
		<DialogContent className='flex flex-col justify-between gap-6 p-4'>
			<div className={clsx('flex gap-6', type !== 'image' && 'flex-col')}>
				<div
					className={clsx(
						'flex flex-1 flex-col gap-4',
						type === 'image' && 'self-center',
					)}
				>
					{urlMode ? (
						<div className='min-w-66'>
							<TextField
								label='Image URL'
								value={url}
								onChange={setUrl}
								placeholder='Paste URL Here'
							/>
						</div>
					) : (
						<div className='flex flex-col gap-2'>
							<button
								type='button'
								className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-2 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
								ref={imageDialogButtonRef}
								onClick={async () => {
									let filePath = null;
									let defaultPath = await mediaFolderPath();
									switch (type) {
										case 'image':
											filePath = await openImage({ defaultPath });
											break;
										case 'video':
											filePath = await openVideo({ defaultPath });
											break;
										case 'audio':
											filePath = await openAudio({ defaultPath });
											break;
									}
									if (!filePath) return;

									if (filePath.startsWith(defaultPath)) {
										// already in media folder, copy not necessary
										const galleryFileName = createWidgetMediaGalleryValue(
											// add 1 to handle the separator
											filePath.substring(defaultPath.length + 1),
										);
										setValue(galleryFileName);
									} else {
										// create new temp copy
										const fileName = await tempCopy(filePath);
										setValue(fileName);
									}
								}}
							>
								<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
								<div className='relative flex flex-1 items-center justify-center gap-3 drop-shadow-[0_1px_3px_#FFFB]'>
									<MediaIcon type={type} className='h-5' />
									<p>
										Select <span>{capitalType}</span>
									</p>
								</div>
							</button>

							<div
								className={clsx(
									'flex text-3.5 font-medium text-zinc-500',
									type === 'image' ? 'flex-col' : 'gap-1',
								)}
							>
								<p>Allowed file types:</p>
								<p>{getMediaFormats(type).join(', ')}</p>
							</div>
						</div>
					)}

					{type === 'image' && (
						<ToggleField
							label='Use Image URL?'
							value={urlMode}
							onChange={setUrlMode}
						/>
					)}
				</div>

				{mediaPath && (
					<div
						className={clsx(
							'flex items-center justify-center overflow-hidden rounded-1 border border-white bg-alpha-checkerboard outline outline-zinc-400 has-focus-visible:outline-2 has-focus-visible:outline-black',
							type === 'image' && 'p-1',
							type === 'audio' &&
								'overflow-visible border-none bg-none outline-none',
						)}
					>
						<MediaPreview
							type={type}
							src={
								urlMode
									? mediaPath
									: mediaPath.startsWith(MEDIA_GALLERY_PREFIX)
										? getWidgetMediaGallerySrc(mediaPath)
										: getTempFileSrc(mediaPath)
							}
							className={clsx(
								'max-h-80 max-w-80',
								type !== 'audio' && 'min-h-24',
								type === 'image' ? 'max-w-80' : 'max-w-120',
							)}
						/>
					</div>
				)}
			</div>

			<div className='flex justify-end gap-4'>
				<DialogCancelButton />
				<DialogConfirmButton
					onClick={() => {
						if (mediaPath) onSave(mediaPath);
						closeDialog();
					}}
					disabled={!mediaPath}
				>
					Save
				</DialogConfirmButton>
			</div>
		</DialogContent>
	);
}
