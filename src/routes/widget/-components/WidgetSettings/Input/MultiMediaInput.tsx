import TrashSvg from '@/components/svg/TrashSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import useWidgetValueKey from '@/contexts/widget_setting_parent/useWidgetValueKey';
import { useWidgetValue } from '@/contexts/widget_values/useWidgetValue';
import { i18nStringTransform } from '@/helpers/i18n';
import { WidgetSetting } from '@/helpers/json/widgetSettings';
import {
	getWidgetMediaCoreSrc,
	getWidgetMediaCustomSrc,
} from '@/helpers/media';
import { Field, Label } from '@headlessui/react';
import { useParams } from '@tanstack/react-router';
import clsx from 'clsx';
import { memo } from 'react';
import { z } from 'zod';
import MediaInputPreview from '../../../../../components/MediaInputPreview';
import InputDescription from './InputDescription';
import SelectMediaDialog from './SelectMediaDialog';

const MultiMediaInput = memo(function MultiMediaInput(
	setting: Props.WithId<
		| WidgetSetting.Input.MultiImage
		| WidgetSetting.Input.MultiVideo
		| WidgetSetting.Input.MultiAudio
	>,
) {
	const key = useWidgetValueKey(setting.id);
	const { widgetValue, setWidgetValue } = useWidgetValue(key);
	const { widgetId } = useParams({ from: '/widget/$widgetId' });
	const { openDialog } = useDialog();

	const values = z
		.array(z.string())
		.catch(setting.defaultValue ?? [])
		.parse(widgetValue);

	const chooseButtonId = `<[slime2-choose-file]>-${key}`;
	const mediaType = getMediaType(setting.type);

	function removeValueAtIndex(index: number) {
		const newValues = [...values];
		newValues.splice(index, 1);
		setWidgetValue(newValues);
	}

	return (
		<Field>
			<div className='input-wrapper flex-col has-focus-visible:outline-2 has-focus-visible:outline-black'>
				<Label className='input-label'>
					{i18nStringTransform(setting.label)}
				</Label>

				<div className='my-3 flex flex-col gap-4 px-2'>
					<button
						id={chooseButtonId}
						type='button'
						className='button-choose-file'
						onClick={() => {
							openDialog(
								<SelectMediaDialog
									type={mediaType}
									onSave={fileName => {
										setWidgetValue([`custom/${fileName}`, ...values]);
									}}
								/>,
							);
						}}
					>
						Add <span className='capitalize'>{mediaType}</span>
					</button>

					{values.map((value, index) => {
						return (
							<div
								key={value}
								className={clsx(
									'bg-alpha-checkerboard rounded-1 group relative flex flex-1 items-center justify-center overflow-hidden border border-white outline outline-stone-300 has-focus-visible:outline-2 has-focus-visible:outline-black',
									mediaType === 'image' && 'p-1',
									mediaType === 'audio' &&
										'overflow-visible border-none bg-none pr-2 outline-none',
								)}
							>
								<MediaInputPreview
									type={mediaType}
									src={
										value.startsWith('https://') || value.startsWith('http://')
											? value
											: value.startsWith('custom/')
												? getWidgetMediaCustomSrc(widgetId, value)
												: getWidgetMediaCoreSrc(widgetId, value)
									}
								/>

								<button
									className={clsx(
										'rounded-1 over:bg-rose-800 over:text-white absolute top-1 right-1 border border-white/50 bg-rose-300 bg-gradient-to-b px-1 py-1.5 text-rose-800 opacity-0 outline outline-rose-700 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-0! focus-visible:outline-black',
										mediaType === 'audio' && '-top-1! -right-1!',
									)}
									onClick={() => {
										removeValueAtIndex(index);
									}}
									onKeyDown={event => {
										if (document.activeElement !== event.currentTarget) return;

										if (event.key === ' ') {
											event.preventDefault();
											removeValueAtIndex(index);

											if (values.length === 1) {
												document.getElementById(chooseButtonId)?.focus();
											}
										}
									}}
								>
									<TrashSvg className='-mt-0.5 size-4' />
									<span className='sr-only capitalize'>Delete {mediaType}</span>
								</button>
							</div>
						);
					})}
				</div>
			</div>

			<InputDescription value={setting.description} />
		</Field>
	);
});

export default MultiMediaInput;

function getMediaType(
	inputType:
		| WidgetSetting.Input.MultiImage['type']
		| WidgetSetting.Input.MultiVideo['type']
		| WidgetSetting.Input.MultiAudio['type'],
) {
	switch (inputType) {
		case 'multi-image-input':
			return 'image';
		case 'multi-video-input':
			return 'video';
		case 'multi-audio-input':
			return 'audio';
	}
}
