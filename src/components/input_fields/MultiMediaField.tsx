import InputDescription from '@/components/input_fields/InputDescription';
import MediaPreview from '@/components/MediaPreview';
import { capitalizeWord } from '@/helpers/string';
import { DEFAULT_VOLUME } from '@@/json/widgetValues';
import { Field, Label } from '@headlessui/react';
import clsx from 'clsx';
import MediaDeleteWrapper from './MediaDeleteWrapper';
import MediaSelectButton from './MediaSelectButton';

type BaseMultiMediaFieldProps = {
	type: 'image';
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
	description?: string;
	volumes?: never;
	onChangeVolumes?: never;
	halfSpan?: boolean;
};

type MultiMediaFieldProps =
	| BaseMultiMediaFieldProps
	| Override<
			BaseMultiMediaFieldProps,
			{
				type: 'audio' | 'video';
				volumes: number[];
				onChangeVolumes: (volumes: number[]) => void;
			}
	  >;

export default function MultiMediaField({
	type,
	label,
	values,
	onChange,
	description,
	volumes,
	onChangeVolumes,
	halfSpan = false,
}: MultiMediaFieldProps) {
	const capitalType = capitalizeWord(type);

	function removeValueAtIndex(index: number) {
		const newValues = [...values];
		newValues.splice(index, 1);
		onChange(newValues);
		if (onChangeVolumes) {
			const newVolumes = [...volumes];
			newVolumes.splice(index, 1);
			onChangeVolumes(newVolumes);
		}
	}

	function updateVolumeAtIndex(index: number, value: number) {
		if (onChangeVolumes) {
			const newVolumes = [...volumes];
			newVolumes[index] = value;
			onChangeVolumes(newVolumes);
		}
	}

	function addValue(newValue: string) {
		onChange([...values, newValue]);
		if (onChangeVolumes) {
			onChangeVolumes([...volumes, DEFAULT_VOLUME]);
		}
	}

	return (
		<Field>
			<div className='input-wrapper flex-col has-data-focus:outline-none'>
				<Label className='input-label'>{label}</Label>

				<div
					className={clsx(
						'gap-x-2 gap-y-6 px-1 py-2',
						halfSpan ? 'flex flex-col' : 'grid grid-cols-2 items-center',
					)}
				>
					<div
						className={clsx('flex flex-1 flex-col', !halfSpan && 'self-start')}
					>
						<MediaSelectButton type={type} onSave={addValue}>
							{`Add ${capitalType}`}
						</MediaSelectButton>
					</div>

					{values.map((value, index) => {
						return (
							<MediaDeleteWrapper
								key={`${value}_${index}`}
								type={type}
								volume={type !== 'image' ? volumes[index] : undefined}
								onChangeVolume={
									type !== 'image'
										? value => {
												updateVolumeAtIndex(index, value);
											}
										: undefined
								}
								onDelete={() => {
									removeValueAtIndex(index);
								}}
							>
								<MediaPreview
									type={type}
									src={value}
									volume={type !== 'image' ? volumes[index] : undefined}
									className={clsx({
										'max-h-32 min-h-24': type === 'image',
										'max-h-48 min-h-24 rounded-1': type === 'video',
									})}
								/>
							</MediaDeleteWrapper>
						);
					})}
				</div>
			</div>

			<InputDescription>{description}</InputDescription>
		</Field>
	);
}
