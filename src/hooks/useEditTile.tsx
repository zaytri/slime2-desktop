import { useDialog } from '@/contexts/dialog/useDialog';
import { mapTileFolderLocationsByIndex } from '@/contexts/tile_locations/useTileFolder';
import useTileLocations from '@/contexts/tile_locations/useTileLocations';
import { useTileLocationsDispatch } from '@/contexts/tile_locations/useTileLocationsDispatch';
import useTileMetas from '@/contexts/tile_metas/useTileMetas';
import { useTileMetasDispatch } from '@/contexts/tile_metas/useTileMetasDispatch';
import useWidgetsPanel from '@/contexts/widgets_panel/useWidgetsPanel';
import {
	deleteWidget,
	deleteWidgetFolder,
	saveTempTileIcon,
} from '@/helpers/commands';
import { getTileIconSrc } from '@/helpers/media';
import { capitalizeWord } from '@/helpers/string';
import { TileColor } from '@/helpers/tileColors';
import EditTileDialog from '@@/dialog/EditTileDialog';
import GenericDeleteDialog from '@@/dialog/GenericDeleteDialog';

export default function useEditTile() {
	const locations = useTileLocations();
	const { removeTile } = useTileLocationsDispatch();
	const tileMetas = useTileMetas();
	const { openDialog } = useDialog();
	const { set: setTileMeta } = useTileMetasDispatch();
	const { onBackFolder, onBackWidget } = useWidgetsPanel();

	function onEdit(id: string, type: 'widget' | 'folder') {
		const tileMeta = tileMetas[id];

		openDialog(
			`Edit ${capitalizeWord(type)}`,
			<EditTileDialog
				type={type}
				name={tileMeta.name}
				iconSrc={getTileIconSrc(id, tileMeta.icon)}
				color={tileMeta.color}
				onSave={async ({ icon, color, name }) => {
					if (icon) await saveTempTileIcon(icon, id);

					const newName =
						name.trim() || tileMeta.name.trim() || `My ${capitalizeWord(type)}`;
					const newIcon = icon
						? `icon/${icon}`
						: tileMeta.icon || `icon/${type}.png`;
					const newColor = color || tileMeta.color || TileColor.Green;

					setTileMeta(id, {
						name: newName,
						color: newColor,
						icon: newIcon,
					});
				}}
				onDelete={() => {
					const widgetCount =
						type === 'folder'
							? mapTileFolderLocationsByIndex(locations, id).size
							: 1;

					openDialog(
						type === 'widget'
							? 'Delete Widget'
							: widgetCount === 0
								? 'Delete Folder'
								: "Can't Delete Folder!",
						<GenericDeleteDialog
							disabled={type === 'folder' && widgetCount > 0}
							onDelete={async () => {
								if (type === 'folder' && widgetCount === 0) {
									onBackFolder(locations[id].index);
									await deleteWidgetFolder(id);
									removeTile(id);
								} else if (type === 'widget') {
									onBackWidget();
									await deleteWidget(id);
									removeTile(id);
									dispatchEvent(
										new CustomEvent('widget-delete', {
											detail: { widgetId: id },
										}),
									);
								}
							}}
						>
							<div className='flex flex-col gap-4'>
								{type === 'widget' && (
									<p>
										Are you sure you want to <strong>permanently</strong> delete
										this widget?
									</p>
								)}

								{type === 'folder' &&
									(widgetCount === 0 ? (
										<p>
											Are you sure you want to <strong>permanently</strong>{' '}
											delete this folder?
										</p>
									) : (
										<p>
											This folder contains <strong>{widgetCount}</strong>{' '}
											widgets. The folder must be empty before it can be
											deleted.
										</p>
									))}

								<div className='flex items-center gap-3 rounded-2 bg-white px-3 py-2 outline-2 outline-zinc-300'>
									{tileMeta.icon && (
										<img
											src={getTileIconSrc(id, tileMeta.icon)}
											className='max-h-12 max-w-24 rounded-1 object-contain smooth-image'
										/>
									)}
									<p className='text-5 font-bold'>{tileMeta.name}</p>
								</div>
							</div>
						</GenericDeleteDialog>,
					);
				}}
			/>,
		);
	}

	return onEdit;
}
