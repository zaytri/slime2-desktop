import TrashSvg from '@/components/svg/TrashSvg';
import {
	type CustomizeFolderPayload,
	useDialog,
} from '@/contexts/dialog/useDialog';
import { useTile } from '@/contexts/tile_map/useTileMap';
import { saveTempFolderIcon, tempCopy } from '@/helpers/commands';
import { getImagePreviewUrl, getTileIconUrl } from '@/helpers/media';
import { openImage } from '@/helpers/openFile';
import { TileColor, tileColorClasses } from '@/helpers/ui';
import {
	Field,
	Fieldset,
	Input,
	Label,
	Legend,
	Radio,
	RadioGroup,
} from '@headlessui/react';
import clsx from 'clsx';
import { memo, useCallback, useState } from 'react';
import DialogHeader from './DialogHeader';

const colors: {
	value: TileColor;
	className: string;
}[] = [
	TileColor.Pink,
	TileColor.Red,
	TileColor.Orange,
	TileColor.Yellow,
	TileColor.Green,
	TileColor.Teal,
	TileColor.Blue,
	TileColor.Purple,
].map(color => ({
	value: color,
	className: tileColorClasses[color].main,
}));

export default memo(function CustomizeFolderDialog() {
	const { close, payload } = useDialog<CustomizeFolderPayload>();
	const folderId = payload.id;
	const { tile, setTile } = useTile(folderId);

	const [name, setName] = useState(tile?.name);
	const [icon, setIcon] = useState<string | undefined>(undefined);
	const [color, setColor] = useState(tile?.color ?? TileColor.Green);
	const [unsavedChanges, setUnsavedChanges] = useState(false);

	const updateIcon = useCallback(async () => {
		const filePath = await openImage();
		if (!filePath) return;

		// create new temp copy
		const fileName = await tempCopy(filePath);

		setIcon(fileName);
		setUnsavedChanges(true);
	}, [openImage, tempCopy, icon]);

	const save = useCallback(async () => {
		if (unsavedChanges) {
			if (icon) await saveTempFolderIcon(icon, folderId);

			setTile({
				name: name ?? tile?.name ?? 'New Folder',
				color: color ?? tile?.color ?? TileColor.Green,
				icon: icon ? `icon/${icon}` : (tile?.icon ?? 'icon/folder.png'),
			});
		}

		close();
	}, [
		icon,
		name,
		color,
		folderId,
		saveTempFolderIcon,
		setTile,
		unsavedChanges,
		close,
	]);

	return (
		<div>
			<DialogHeader>Customize Folder</DialogHeader>
			<div className='flex flex-col gap-4'>
				<Field className='flex flex-col gap-1'>
					<Label className='font-medium'>Name</Label>
					<Input
						autoComplete='none'
						type='text'
						value={name}
						onChange={event => {
							setName(event.target.value);
							setUnsavedChanges(true);
						}}
						className='w-full rounded-2 border border-slate-400 bg-white px-2 py-1 font-quicksand text-lg'
					/>
				</Field>

				<div className='flex gap-4'>
					<Field className='flex flex-col gap-1'>
						<Label className='font-medium'>Icon</Label>
						<button
							type='button'
							className='group flex flex-col items-stretch'
							onClick={updateIcon}
						>
							<img
								src={
									icon
										? getImagePreviewUrl(icon)
										: getTileIconUrl(folderId, tile?.icon ?? '')
								}
								className='relative h-40 w-48 overflow-hidden rounded-2 rounded-b-0 border-2 border-b-0 border-slate-700 bg-white object-cover smooth-image'
							/>

							<div className='flex-1 rounded-2 rounded-t-0 border-2 border-amber-800 bg-amber-300 bg-gradient-to-b from-amber-200 from-50% to-amber-300 to-50% py-1 text-lg font-medium text-amber-900 group-over:bg-none group-over:shadow-none'>
								Change Icon
							</div>
						</button>
					</Field>

					<Fieldset className='flex flex-1 flex-col gap-1'>
						<Legend className='font-medium'>Color</Legend>

						<div className='flex h-full flex-col gap-2'>
							<div
								className={clsx(
									'flex-1 rounded-2 border-2 border-slate-700',
									tileColorClasses[color].main,
								)}
							></div>

							<RadioGroup
								value={color}
								onChange={value => {
									setColor(value);
									setUnsavedChanges(true);
								}}
								className='grid grid-cols-4 gap-0.5 overflow-hidden rounded-2 border-2 border-slate-700 bg-slate-700 outline-2 outline-offset-2 has-[[data-focus]]:outline'
							>
								{colors.map(({ value, className }) => {
									return (
										<Field key={value} className='flex-1'>
											<Radio value={value} className='group over:outline-none'>
												<div
													className={clsx(
														'flex h-6 w-full items-center justify-center',
														className,
													)}
												>
													<div className='hidden h-2.5 w-2.5 rounded-full bg-slate-700 group-data-[checked]:block group-over:block'></div>
												</div>
											</Radio>
											<Label className='sr-only'>{value}</Label>
										</Field>
									);
								})}
							</RadioGroup>
						</div>
					</Fieldset>
				</div>

				<div className='flex gap-2'>
					<button
						type='button'
						className='flex-1 rounded-2 border-2 border-emerald-800 bg-lime-400 bg-gradient-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800 over:translate-y-0.5 over:bg-none over:shadow-none'
						onClick={save}
					>
						Save
					</button>

					<button
						type='button'
						className='group flex items-center gap-0 rounded-lg border-2 border-rose-800 bg-rose-300 bg-gradient-to-b from-rose-300 from-50% to-rose-400 to-50% px-4 font-medium text-rose-900 shadow-[0_2px] shadow-rose-800 transition-[gap] over:translate-y-[2px] over:gap-2 over:bg-none over:shadow-none'
					>
						<span className='text-[.1px] opacity-0 transition-[font-size] group-over:text-xl group-over:opacity-100'>
							Delete Folder
						</span>
						<TrashSvg className='size-4' />
					</button>
				</div>
			</div>
		</div>
	);
});
