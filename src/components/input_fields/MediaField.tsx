import InputDescription from '@/components/input_fields/InputDescription';
import MediaPreview from '@/components/MediaPreview';
import { capitalizeWord } from '@/helpers/string';
import { DEFAULT_VOLUME } from '@@/json/widgetValues';
import { Field, Label } from '@headlessui/react';
import clsx from 'clsx';
import MediaDeleteWrapper from './MediaDeleteWrapper';
import MediaSelectButton from './MediaSelectButton';

type BaseMediaFieldProps = {
	type: 'image';
	label: string;
	value: string;
	onChange: (value: string) => void;
	description?: string;
	volume?: never;
	onChangeVolume?: never;
	halfSpan?: boolean;
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
	halfSpan = false,
}: MediaFieldProps) {
	const capitalType = capitalizeWord(type);

	return (
		<Field>
			<div className='input-wrapper flex-col has-data-focus:outline-none'>
				<Label className='input-label'>{label}</Label>

				<div
					className={clsx(
						'gap-x-2 gap-y-6 px-1 py-2',
						halfSpan ? 'flex flex-col' : 'grid grid-cols-2',
					)}
				>
					<div className='flex flex-1 flex-col'>
						<MediaSelectButton type={type} onSave={onChange}>
							{`${value ? 'Change' : 'Add'} ${capitalType}`}
						</MediaSelectButton>
					</div>

					{value && (
						<MediaDeleteWrapper
							type={type}
							volume={volume}
							onChangeVolume={onChangeVolume}
							onDelete={() => {
								onChange('');
								if (onChangeVolume) {
									onChangeVolume(DEFAULT_VOLUME);
								}
							}}
						>
							<MediaPreview
								type={type}
								src={value}
								volume={volume}
								className={clsx({
									'max-h-32 min-h-24': type === 'image',
									'max-h-48 min-h-24 rounded-1': type === 'video',
								})}
							/>
						</MediaDeleteWrapper>
					)}
				</div>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
