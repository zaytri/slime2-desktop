import { useDialog } from '@/contexts/dialog/useDialog';
import useTileFolder, {
	TILES_PER_PAGE,
} from '@/contexts/tile_locations/useTileFolder';
import { useTileLocationsDispatch } from '@/contexts/tile_locations/useTileLocationsDispatch';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { useNavigate } from '@tanstack/react-router';
import { memo } from 'react';
import Tile from '../Tile';
import EmptyTile from '../Tile/EmptyTile';

type FolderPageProps = {
	folderId: string;
	page: number;
};

const TileGrid = memo(function TileGrid({ folderId, page }: FolderPageProps) {
	const { getPage: getPage } = useTileFolder(folderId);
	const { tileMeta: folderTileMeta } = useTileMeta(folderId);
	const { removeTile } = useTileLocationsDispatch();
	const { open } = useDialog();
	const navigate = useNavigate();

	return (
		<div className='grid flex-1 grid-cols-5 gap-0'>
			{getPage(page).map((tile, index) => {
				const tileIndex = index + page * TILES_PER_PAGE;

				return (
					<button
						type='button'
						key={tileIndex}
						className='group flex items-center justify-center'
						onClick={async () => {
							if (tile.id) {
								if (tile.type === 'folder') {
									await navigate({
										to: '/folder/$folderId',
										params: { folderId: tile.id },
									});
								} else {
									await navigate({
										to: '/widget/$widgetId',
										params: { widgetId: tile.id },
									});
									// await deleteWidget(tile.id);
									// removeTile(tile.id);
								}
							} else {
								open({
									name: 'CreateTile',
									payload: { folderId, index: tileIndex },
								});
							}
						}}
					>
						<div className='relative aspect-9/8 w-3/4 min-w-36'>
							{tile.id ? (
								<Tile
									id={tile.id}
									index={tile.index}
									type={tile.type}
									folderColor={folderTileMeta.color}
								/>
							) : (
								<EmptyTile folderColor={folderTileMeta.color} />
							)}
						</div>
					</button>
				);
			})}
		</div>
	);
});

export default TileGrid;
