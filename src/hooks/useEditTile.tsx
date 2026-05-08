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
import GenericErrorDialog from '@@/dialog/GenericErrorDialog';
import type { TileMeta } from '@@/json/tileMeta';

export default function useEditTile() {
	const locations = useTileLocations();
	const { removeTile } = useTileLocationsDispatch();
	const tileMetas = useTileMetas();
	const { openDialog } = useDialog();
	const { set: setTileMeta } = useTileMetasDispatch();
	const { onBackFolder, onBackWidget } = useWidgetsPanel();

	function onEdit(id: string, type: 'widget' | 'folder') {
		const tileMeta = tileMetas[id];
		if (!tileMeta) return;

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

					if (type === 'widget') {
						_onDeleteWidget(id, tileMeta);
					} else if (type === 'folder') {
						if (widgetCount > 0) {
							_onFolderNotEmpty(id, widgetCount, tileMeta);
						} else {
							const index = locations[id]?.index;
							if (index === undefined) return;
							_onDeleteFolder(id, index, tileMeta);
						}
					}
				}}
			/>,
		);
	}

	function _onDeleteWidget(id: string, tileMeta: TileMeta) {
		openDialog(
			'Delete Widget',
			<GenericDeleteDialog
				onDelete={async () => {
					onBackWidget();
					await deleteWidget(id);
					removeTile(id);
					dispatchEvent(
						new CustomEvent('widget-delete', {
							detail: { widgetId: id },
						}),
					);
				}}
			>
				<div className='flex flex-col gap-4'>
					<p>
						Are you sure you want to <strong>permanently</strong> delete this
						widget?
					</p>
					<TilePreview id={id} tileMeta={tileMeta} />
				</div>
			</GenericDeleteDialog>,
		);
	}

	function _onDeleteFolder(id: string, index: number, tileMeta: TileMeta) {
		openDialog(
			'Delete Folder',
			<GenericDeleteDialog
				onDelete={async () => {
					onBackFolder(index);
					await deleteWidgetFolder(id);
					removeTile(id);
				}}
			>
				<div className='flex flex-col gap-4'>
					<p>
						Are you sure you want to <strong>permanently</strong> delete this
						folder?
					</p>
					<TilePreview id={id} tileMeta={tileMeta} />
				</div>
			</GenericDeleteDialog>,
		);
	}

	function _onFolderNotEmpty(
		id: string,
		widgetCount: number,
		tileMeta: TileMeta,
	) {
		openDialog(
			"Can't Delete Folder!",
			<GenericErrorDialog>
				<div className='flex flex-col gap-4'>
					<p>
						This folder contains <strong>{widgetCount}</strong> widgets. It must
						be empty before it can be deleted.
					</p>
					<TilePreview id={id} tileMeta={tileMeta} />
				</div>
			</GenericErrorDialog>,
		);
	}

	return onEdit;
}

type TilePreviewProps = {
	id: string;
	tileMeta: TileMeta;
};

function TilePreview({ id, tileMeta }: TilePreviewProps) {
	return (
		<div className='flex items-center gap-3 rounded-2 bg-white px-3 py-2 outline-2 outline-zinc-300'>
			{tileMeta.icon && (
				<img
					src={getTileIconSrc(id, tileMeta.icon)}
					className='max-h-12 max-w-24 rounded-1 object-contain smooth-image'
				/>
			)}
			<p className='text-5 font-bold'>{tileMeta.name}</p>
		</div>
	);
}
