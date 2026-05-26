import { useDialog } from '@/contexts/dialog/useDialog';
import { tempCopy } from '@/helpers/commands';
import { getTempFileSrc } from '@/helpers/media';
import { IMAGE_FORMATS, openImage } from '@/helpers/openFile';
import { capitalizeWord } from '@/helpers/string';
import { TileColor, tileColorClasses } from '@/helpers/tileColors';
import type { TileMeta } from '@@/json/tileMeta';
import WaveSvg from '@@/svg/WaveSvg';
import {
	Field,
	Fieldset,
	Label,
	Legend,
	Radio,
	RadioGroup,
} from '@headlessui/react';
import clsx from 'clsx';
import { useState } from 'react';
import TextField from '../input_fields/TextField';
import MediaPreview from '../MediaPreview';
import PhotoSvg from '../svg/PhotoSvg';
import DialogCancelButton from './DialogButton/DialogCancelButton';
import DialogConfirmButton from './DialogButton/DialogConfirmButton';
import DialogDangerButton from './DialogButton/DialogDangerButton';
import DialogContent from './DialogContent';

type EditTileDialogProps = {
	name: string;
	iconSrc: string;
	color: TileColor;
	onSave: (meta: TileMeta) => void;
	type: 'folder' | 'widget';
	onDelete: VoidFunction;
};

export default function EditTileDialog({
	name,
	iconSrc,
	onSave,
	type,
	color,
	onDelete,
}: EditTileDialogProps) {
	const { closeDialog } = useDialog();
	const [tempName, setTempName] = useState(name);
	const [tempIcon, setTempIcon] = useState('');
	const [tempColor, setTempColor] = useState(color || TileColor.Green);
	const capitalType = capitalizeWord(type);

	return (
		<DialogContent className='flex flex-col justify-between gap-4 p-4'>
			<div className='flex flex-col gap-4'>
				<TextField
					autoFocus
					label={`${capitalType} Name`}
					value={tempName}
					onChange={setTempName}
					placeholder={`My ${capitalType}`}
				/>

				<Field>
					<div className='input-wrapper flex flex-col'>
						<Label className='input-label'>{capitalType} Icon</Label>
						<div className='flex gap-4 p-2'>
							<div className='flex size-40 items-center justify-center overflow-hidden rounded-2 border border-white bg-alpha-checkerboard outline outline-zinc-400'>
								<MediaPreview
									type='image'
									src={tempIcon ? getTempFileSrc(tempIcon) : iconSrc}
									className='max-h-full'
								/>
							</div>

							<div className='flex flex-1 flex-col gap-2'>
								<button
									type='button'
									className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-1.5 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
									onClick={async () => {
										const filePath = await openImage();
										if (!filePath) return;

										// create new temp copy
										const fileName = await tempCopy(filePath);

										setTempIcon(fileName);
									}}
								>
									<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
									<div className='relative flex flex-1 items-center justify-center gap-3 drop-shadow-[0_1px_3px_#FFFB]'>
										<PhotoSvg className='size-5' />
										<p>Change Icon</p>
									</div>
								</button>

								<div className='text-3.5 text-zinc-500'>
									<p>Allowed file types:</p>
									<p>{IMAGE_FORMATS.join(', ')}</p>
								</div>
							</div>
						</div>
					</div>
				</Field>

				{type === 'folder' && (
					<Fieldset className='input-wrapper flex-col'>
						<Legend className='input-label'>Folder Color</Legend>

						<div className='flex items-center justify-between gap-2 p-2'>
							<FolderColorPreview
								className={clsx('w-32', tileColorClasses[tempColor])}
							/>

							<div className='flex flex-1 items-center justify-center'>
								<RadioGroup
									value={tempColor}
									onChange={setTempColor}
									className='grid grid-cols-4 gap-3 outline-none'
								>
									{Object.entries(tileColorClasses).map(
										([color, className]) => {
											return (
												<Field key={color}>
													<Radio
														value={color}
														className='group/radio relative flex rounded-2 outline outline-zinc-400 data-checked:outline-3 data-checked:outline-zinc-800 over:outline-3 over:outline-zinc-800'
													>
														<FolderColorPreview
															className={clsx('w-14 outline-none!', className)}
														/>
													</Radio>

													<Label className='sr-only'>{color}</Label>
												</Field>
											);
										},
									)}
								</RadioGroup>
							</div>
						</div>
					</Fieldset>
				)}
			</div>

			<div className='flex justify-between gap-4'>
				<div>
					<DialogDangerButton onClick={onDelete}>Delete</DialogDangerButton>
				</div>

				<div className='flex gap-4'>
					<DialogCancelButton />
					<DialogConfirmButton
						onClick={() => {
							onSave({ name: tempName, icon: tempIcon, color: tempColor });
							closeDialog();
						}}
					>
						Save
					</DialogConfirmButton>
				</div>
			</div>
		</DialogContent>
	);
}

function FolderColorPreview({ className }: Props.WithClassName) {
	return (
		<div
			className={clsx(
				'relative aspect-9/8 rounded-2 border border-white bg-linear-to-b outline outline-zinc-400',
				className,
			)}
		>
			<div className='absolute inset-0 bg-black text-white opacity-20 mix-blend-overlay'>
				<WaveSvg />
			</div>
		</div>
	);
}
