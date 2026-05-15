import GenericDeleteDialog from '@/components/dialog/GenericDeleteDialog';
import MediaSelectDialog from '@/components/dialog/MediaSelectDialog';
import InputDescription from '@/components/input_fields/InputDescription';
import MediaIcon from '@/components/MediaIcon';
import MediaInputPreview from '@/components/MediaInputPreview';
import { useDialog } from '@/contexts/dialog/useDialog';
import XSvg from '@@/svg/XSvg';
import { Button, Field, Input, Label } from '@headlessui/react';
import clsx from 'clsx';
import { useRef } from 'react';

type BaseMediaFieldProps = {
	type: 'image';
	label: string;
	value: string;
	onChange: (value: string) => void;
	description?: string;
	volume?: never;
	onChangeVolume?: never;
};

type MediaFieldProps =
	| BaseMediaFieldProps
	| Override<
			BaseMediaFieldProps,
			{
				type: 'audio' | 'video';
				volume: number;
				onChangeVolume: (volume: number) => void;
			}
	  >;

export default function MediaField({
	type,
	label,
	value,
	onChange,
	description,
	volume,
	onChangeVolume,
}: MediaFieldProps) {
	const { openDialog } = useDialog();
	const imageDialogButtonRef = useRef<HTMLButtonElement>(null);

	const capitalType = `${type.charAt(0).toUpperCase()}${type.slice(1)}`;

	return (
		<Field>
			<div className='input-wrapper flex-col has-data-focus:outline-none'>
				<Label className='input-label'>{label}</Label>

				<div className='grid grid-cols-2 gap-8 px-1 py-2'>
					{value && (
						<div
							className={clsx(
								'relative flex flex-1 items-center justify-center border border-white bg-alpha-checkerboard outline has-data-over:outline-4 has-data-over:outline-rose-800',
								type === 'audio'
									? 'self-center rounded-full border-none bg-none outline-transparent'
									: 'rounded-1 outline-zinc-400',
							)}
						>
							<MediaInputPreview
								type={type}
								src={value}
								volume={volume}
								className={clsx('rounded-1', {
									'max-h-32 min-h-24': type === 'image',
									'max-h-48 min-h-24': type === 'video',
								})}
							/>

							<Button
								className={clsx(
									'peer absolute -top-3 -right-3 z-10 rounded-1.5 border border-rose-900 bg-rose-800 p-1.5 text-white outline-none',
								)}
								onClick={() => {
									openDialog(
										`Delete ${capitalType}`,
										<GenericDeleteDialog
											onDelete={() => {
												onChange('');
												if (onChangeVolume) {
													onChangeVolume(20);
												}
											}}
										>
											<p>
												Are you sure you want to <strong>permanently</strong>{' '}
												delete this {type}?
											</p>
										</GenericDeleteDialog>,
									);
								}}
							>
								<span className='sr-only'>Delete {capitalType}</span>
								<XSvg className='h-3.5 drop-shadow-[0_1px_#0008]' />
							</Button>

							<div
								className={clsx(
									'pointer-events-none absolute inset-0 bg-rose-400 opacity-0 peer-data-over:opacity-15',
									type === 'audio' ? 'rounded-full' : 'rounded-1',
								)}
							></div>
						</div>
					)}

					<div className='flex flex-1 flex-col gap-4'>
						<button
							type='button'
							className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-1.5 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
							ref={imageDialogButtonRef}
							onClick={() => {
								openDialog(
									`File Select`,
									<MediaSelectDialog type={type} onSave={onChange} />,
								);
							}}
						>
							<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
							<div className='relative flex flex-1 items-center justify-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
								<MediaIcon type={type} className='h-5' />
								<p>
									{value ? 'Change' : 'Add'} <span>{capitalType}</span>
								</p>
							</div>
						</button>

						{type !== 'image' && value && (
							<Field className='flex items-center gap-2'>
								<Label className='rounded-1 border border-black bg-zinc-800 px-2 py-0.5 input-label text-white'>
									{capitalType} Volume
								</Label>
								<Input
									className='flex-1'
									type='range'
									value={volume === undefined ? 20 : volume}
									min={0}
									max={100}
									step='any'
									onChange={event => {
										const newVolume = event.target.valueAsNumber;

										if (Number.isNaN(newVolume)) {
											onChangeVolume(0);
										} else {
											onChangeVolume(Math.max(Math.min(newVolume, 100), 0));
										}
									}}
								/>
							</Field>
						)}
					</div>
				</div>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
