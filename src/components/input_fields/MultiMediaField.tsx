import InputDescription from '@/components/input_fields/InputDescription';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import { saveTempWidgetFile } from '@/helpers/commands';
import {
	getWidgetMediaCoreSrc,
	getWidgetMediaCustomSrc,
} from '@/helpers/media';
import { getMediaFormats, MediaType } from '@/helpers/openFile';
import XSvg from '@@/svg/XSvg';
import { Button, Field, Label } from '@headlessui/react';
import clsx from 'clsx';
import { useRef } from 'react';
import MediaIcon from '../MediaIcon';
import MediaInputPreview from '../MediaInputPreview';
import GenericDeleteDialog from '../dialog/GenericDeleteDialog';
import MediaSelectDialog from '../dialog/MediaSelectDialog';

type MultiMediaFieldProps = {
	type: MediaType;
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
	description?: string;
};

export default function MultiMediaField({
	type,
	label,
	values,
	onChange,
	description,
}: MultiMediaFieldProps) {
	const widgetId = useWidgetId();
	const { openDialog } = useDialog();
	const imageDialogButtonRef = useRef<HTMLButtonElement>(null);

	const capitalType = `${type.charAt(0).toUpperCase()}${type.slice(1)}`;

	function removeValueAtIndex(index: number) {
		const newValues = [...values];
		newValues.splice(index, 1);
		onChange(newValues);
	}

	return (
		<Field>
			<div className='input-wrapper flex-col has-data-focus:outline-none'>
				<Label className='input-label'>{label}</Label>

				<div className='flex gap-8 px-1 py-2'>
					{values.length > 0 && (
						<div
							className={clsx('grid gap-4 self-center', {
								'flex-1 grid-cols-1': values.length === 1,
								'flex-4 grid-cols-2': values.length > 1 && type !== 'image',
								'flex-2 grid-cols-2': values.length === 2 && type === 'image',
								'flex-4 grid-cols-3': values.length > 2 && type === 'image',
							})}
						>
							{values.map((value, index) => {
								const src =
									value.startsWith('https://') || value.startsWith('http://')
										? value
										: value.startsWith('custom/')
											? getWidgetMediaCustomSrc(widgetId, value)
											: getWidgetMediaCoreSrc(widgetId, value);

								return (
									<div
										key={value}
										className={clsx(
											'relative flex items-center justify-center border border-white bg-alpha-checkerboard outline has-data-over:outline-4 has-data-over:outline-rose-800',
											type === 'audio'
												? 'rounded-full border-none bg-none outline-transparent'
												: 'rounded-1 outline-zinc-400',
										)}
									>
										<MediaInputPreview
											type={type}
											src={src}
											className={clsx('rounded-1', {
												'max-h-32 min-h-24':
													type === 'image' && values.length <= 3,
												'max-h-32 min-h-16':
													type === 'image' && values.length > 3,
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
															removeValueAtIndex(index);
														}}
													>
														<p>
															Are you sure you want to{' '}
															<strong>permanently</strong> delete this {type}?
														</p>
													</GenericDeleteDialog>,
												);
											}}
										>
											<XSvg className='h-3.5 drop-shadow-[0_1px_#0008]' />
										</Button>

										<div
											className={clsx(
												'pointer-events-none absolute inset-0 bg-rose-400 opacity-0 peer-data-over:opacity-15',
												type === 'audio' ? 'rounded-full' : 'rounded-1',
											)}
										></div>

										<span className='sr-only'>Delete {capitalType}</span>
									</div>
								);
							})}
						</div>
					)}

					<div className='flex flex-1 flex-col items-start gap-2'>
						<button
							type='button'
							className='relative flex rounded-2 border border-white bg-zinc-200 bg-linear-to-b from-zinc-200 to-zinc-300 px-2 py-1.5 font-fredoka text-4.5 font-medium text-zinc-700 outline-2 outline-offset-0! outline-zinc-400 over:bg-lime-200 over:bg-none over:text-lime-800 over:outline-4 over:outline-lime-600'
							ref={imageDialogButtonRef}
							onClick={() => {
								openDialog(
									`File Select`,
									<MediaSelectDialog
										type={type}
										onSave={async value => {
											const fileName = await saveTempWidgetFile(
												value,
												widgetId,
											);
											onChange([`custom/${fileName}`, ...values]);
										}}
									/>,
								);
							}}
						>
							<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
							<div className='relative flex flex-1 items-center gap-2 drop-shadow-[0_1px_3px_#FFFB]'>
								<MediaIcon type={type} className='h-5' />
								<p>
									Add <span>{capitalType}</span>
								</p>
							</div>
						</button>

						<div className='text-3.5 text-zinc-500'>
							<p>Allowed file types:</p>
							<p>{getMediaFormats(type).join(', ')}</p>
						</div>
					</div>
				</div>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
