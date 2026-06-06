import { useDialog } from '@/contexts/dialog/useDialog';
import { capitalizeWord } from '@/helpers/string';
import GenericDeleteDialog from '@@/dialog/GenericDeleteDialog';
import { DEFAULT_VOLUME } from '@@/json/widgetValues';
import XSvg from '@@/svg/XSvg';
import { Button, Field, Input, Label } from '@headlessui/react';
import clsx from 'clsx';

type MediaDeleteWrapperProps = {
	type: 'image' | 'audio' | 'video';
	onDelete: VoidFunction;
	volume?: number;
	onChangeVolume?: (value: number) => void;
};

export default function MediaDeleteWrapper({
	type,
	onDelete,
	children,
	volume,
	onChangeVolume,
}: Props.WithChildren<MediaDeleteWrapperProps>) {
	const { openDialog } = useDialog();
	const capitalType = capitalizeWord(type);

	return (
		<div className='relative mx-2 flex flex-col gap-3 rounded-1 has-[button[data-focus]]:outline-4 has-[button[data-focus]]:outline-rose-800 has-[button[data-hover]]:outline-4 has-[button[data-hover]]:outline-rose-800'>
			<div
				className={clsx(
					'border border-white bg-alpha-checkerboard outline',
					type === 'audio'
						? 'rounded-full border-none bg-none outline-transparent'
						: 'flex items-center justify-center rounded-1 outline-zinc-400',
				)}
			>
				{children}
			</div>

			{!!onChangeVolume && (
				<Field className='mx-2 flex items-center gap-2 pb-2'>
					<Label className='rounded-1 border border-black bg-zinc-800 px-2 py-0.5 input-label text-white'>
						{capitalType} Volume
					</Label>
					<Input
						className='flex-1'
						type='range'
						value={volume ?? DEFAULT_VOLUME}
						min={0}
						max={1}
						step='any'
						onChange={event => {
							const newVolume = event.target.valueAsNumber;

							onChangeVolume(
								Number.isNaN(newVolume)
									? 0
									: Math.max(Math.min(newVolume, 1), 0),
							);
						}}
					/>
				</Field>
			)}

			<Button
				className={clsx(
					'peer absolute -top-3 -right-3 z-10 rounded-1.5 border border-rose-900 bg-rose-800 p-1.5 text-white outline-none',
				)}
				onClick={() => {
					openDialog(
						`Delete ${capitalType}`,
						<GenericDeleteDialog onDelete={onDelete}>
							<p>
								Are you sure you want to <strong>permanently</strong> delete
								this {type}?
							</p>
						</GenericDeleteDialog>,
					);
				}}
			>
				<span className='sr-only'>Delete {capitalType}</span>
				<XSvg className='size-3.5 drop-shadow-[0_1px_#0008]' />
			</Button>

			<div className='pointer-events-none absolute inset-0 rounded-1 bg-rose-400 opacity-0 peer-data-over:opacity-15'></div>
		</div>
	);
}
