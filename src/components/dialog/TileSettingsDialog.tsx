import TrashSvg from '@/components/svg/TrashSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { saveTempTileIcon, tempCopy } from '@/helpers/commands';
import { getTempFileSrc, getTileIconSrc } from '@/helpers/media';
import { openImage } from '@/helpers/openFile';
import { TileColor, tileColorClasses } from '@/helpers/tileColors';
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
import DeleteFolderDialog from './DeleteFolderDialog';
import DeleteWidgetDialog from './DeleteWidgetDialog';
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

type TileSettingsDialogProps = {
	id: string;
};

const TileSettingsDialog = memo(function TileSettingsDialog({
	id,
}: TileSettingsDialogProps) {
	const { closeDialog, openDialog } = useDialog();
	const { tileMeta, setTileMeta } = useTileMeta(id);

	const [name, setName] = useState(tileMeta.name);
	const [icon, setIcon] = useState<string | undefined>(undefined);
	const [color, setColor] = useState(tileMeta.color ?? TileColor.Green);
	const [unsavedChanges, setUnsavedChanges] = useState(false);

	const type = id.startsWith('folder') ? 'folder' : 'widget';

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
			if (icon) await saveTempTileIcon(icon, id);

			setTileMeta({
				name: name ?? tileMeta.name ?? 'New Folder',
				color: color ?? tileMeta.color ?? TileColor.Green,
				icon: icon ? `icon/${icon}` : (tileMeta.icon ?? 'icon/folder.png'),
			});
		}

		closeDialog();
	}, [
		icon,
		name,
		color,
		id,
		saveTempTileIcon,
		setTileMeta,
		unsavedChanges,
		closeDialog,
	]);

	return (
		<div>
			<DialogHeader>Edit Tile</DialogHeader>
			<div className='flex flex-col gap-4'>
				<Field className='flex flex-col gap-1'>
					<Label className='font-medium'>Name</Label>
					<Input
						autoComplete='off'
						aria-autocomplete='none'
						type='text'
						value={name}
						onChange={event => {
							setName(event.target.value);
							setUnsavedChanges(true);
						}}
						className='rounded-2 font-quicksand w-full border border-slate-400 bg-white px-2 py-1 text-lg'
					/>
				</Field>

				<div className='flex gap-4'>
					<Field className='flex flex-1 flex-col gap-1'>
						<Label className='self-start font-medium'>Icon</Label>
						<button
							type='button'
							className='group flex flex-col items-stretch'
							onClick={updateIcon}
						>
							<img
								src={
									icon
										? getTempFileSrc(icon)
										: getTileIconSrc(id, tileMeta.icon)
								}
								className={clsx(
									'rounded-2 rounded-b-0 smooth-image relative overflow-hidden border-2 border-b-0 border-slate-700 bg-white object-contain',
									type === 'folder' ? 'h-40 w-48' : 'h-72 w-full',
								)}
							/>

							<div className='rounded-2 rounded-t-0 group-over:bg-none group-over:shadow-none flex-1 border-2 border-amber-800 bg-amber-300 bg-linear-to-b from-amber-200 from-50% to-amber-300 to-50% py-1 text-lg font-medium text-amber-900'>
								Change Icon
							</div>
						</button>
					</Field>

					{type === 'folder' && (
						<Fieldset className='flex flex-1 flex-col gap-1'>
							<Legend className='font-medium'>Color</Legend>

							<div className='flex h-full flex-col gap-2'>
								<div
									className={clsx(
										'rounded-2 flex-1 border-2 border-slate-700',
										tileColorClasses[color].main,
									)}
								></div>

								<RadioGroup
									value={color}
									onChange={value => {
										setColor(value);
										setUnsavedChanges(true);
									}}
									className='rounded-2 grid grid-cols-4 gap-0.5 overflow-hidden border-2 border-slate-700 bg-slate-700 outline-offset-2 has-data-focus:outline-2'
								>
									{colors.map(({ value, className }) => {
										return (
											<Field key={value} className='flex-1'>
												<Radio
													value={value}
													className='group over:outline-hidden'
												>
													<div
														className={clsx(
															'flex h-6 w-full items-center justify-center',
															className,
														)}
													>
														<div className='group-over:block hidden h-2.5 w-2.5 rounded-full bg-slate-700 group-data-checked:block'></div>
													</div>
												</Radio>
												<Label className='sr-only'>{value}</Label>
											</Field>
										);
									})}
								</RadioGroup>
							</div>
						</Fieldset>
					)}
				</div>

				<div className='flex gap-2'>
					<button
						type='button'
						className='rounded-2 over:translate-y-0.5 over:bg-none over:shadow-none flex-1 border-2 border-emerald-800 bg-lime-400 bg-linear-to-b from-lime-300 from-50% to-lime-400 to-50% py-2 text-xl font-medium text-emerald-900 shadow-[0_2px] shadow-emerald-800'
						onClick={save}
					>
						Save
					</button>

					<button
						type='button'
						className='group over:translate-y-[2px] over:gap-2 over:bg-none over:shadow-none flex items-center gap-0 rounded-lg border-2 border-rose-800 bg-rose-300 bg-linear-to-b from-rose-300 from-50% to-rose-400 to-50% px-4 font-medium text-rose-900 shadow-[0_2px] shadow-rose-800 transition-[gap]'
						onClick={() => {
							openDialog(
								type === 'folder' ? (
									<DeleteFolderDialog id={id} />
								) : (
									<DeleteWidgetDialog id={id} />
								),
								() => {
									openDialog(<TileSettingsDialog id={id} />);
								},
							);
						}}
					>
						<span className='group-over:text-xl group-over:opacity-100 text-[.1px] opacity-0 transition-[font-size]'>
							Delete {type === 'folder' ? 'Folder' : 'Widget'}
						</span>
						<TrashSvg className='size-4' />
					</button>
				</div>
			</div>
		</div>
	);
});

export default TileSettingsDialog;
