import MediaInputPreview from '@/components/MediaInputPreview';
import { SelectMediaPayload } from '@/contexts/dialog/DialogType';
import { useDialog } from '@/contexts/dialog/useDialog';
import { saveTempWidgetFile, tempCopy } from '@/helpers/commands';
import { getTempFileSrc } from '@/helpers/media';
import {
	AUDIO_FORMATS,
	IMAGE_FORMATS,
	openAudio,
	openImage,
	openVideo,
	VIDEO_FORMATS,
} from '@/helpers/openFile';
import InputDescription from '@/routes/widget/-components/WidgetSettings/Input/InputDescription';
import { useParams } from '@tanstack/react-router';
import clsx from 'clsx';
import { memo, useState } from 'react';
import DialogHeader from './DialogHeader';

const SelectMediaDialog = memo(function SelectMediaDialog() {
	const {
		payload: { type, onSave },
		close,
	} = useDialog<SelectMediaPayload>();
	const { widgetId } = useParams({ from: '/widget/$widgetId' });
	const [value, setValue] = useState<string | undefined>(undefined);

	const chooseButtonId = `[slime2-choose-file]`;

	return (
		<>
			<DialogHeader>
				Add <span className='capitalize'>{type}</span>
			</DialogHeader>

			<div className='flex flex-1 flex-col gap-4'>
				<div className='flex flex-1 flex-col items-center justify-center gap-1'>
					<button
						id={chooseButtonId}
						type='button'
						className='button-choose-file'
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
						Choose <span className='capitalize'>{type}</span>
					</button>

					<InputDescription
						id={chooseButtonId}
						value={`Allowed file types: ${fileFormats(type).join(', ')}`}
					/>
				</div>

				{value && (
					<>
						<div
							className={clsx(
								'bg-alpha-checkerboard rounded-1 flex w-128 items-center justify-center overflow-hidden border border-white outline outline-stone-300 has-focus-visible:outline-2 has-focus-visible:outline-black',
								type === 'image' && 'p-1',
								type === 'audio' &&
									'overflow-visible border-none bg-none outline-none',
							)}
						>
							<MediaInputPreview type={type} src={getTempFileSrc(value)} />
						</div>

						<button
							type='button'
							className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
							onClick={async () => {
								if (value) {
									const fileName = await saveTempWidgetFile(value, widgetId);
									onSave(fileName);
								}

								close();
							}}
						>
							Save
						</button>
					</>
				)}
			</div>
		</>
	);
});

export default SelectMediaDialog;

function fileFormats(type: SelectMediaPayload['type']): string[] {
	switch (type) {
		case 'image':
			return IMAGE_FORMATS;
		case 'video':
			return VIDEO_FORMATS;
		case 'audio':
			return AUDIO_FORMATS;
	}
}
