import useTileFolder, {
	TILES_PER_PAGE,
} from '@/contexts/tile_locations/useTileFolder';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { memo } from 'react';
import Tile from '../Tile';
import EmptyTile from '../Tile/EmptyTile';

type FolderPageProps = {
	folderId: string;
};

const TileGrid = memo(function TileGrid({ folderId }: FolderPageProps) {
	const { getPage } = useTileFolder(folderId);
	const { tileMeta: folderTileMeta } = useTileMeta(folderId);

	return (
		<div className='grid flex-1 grid-cols-5 gap-0'>
			{getPage(0).map((tile, index) => {
				const tileIndex = index + 0 * TILES_PER_PAGE;

				return tile.id ? (
					<Tile
						key={tileIndex}
						id={tile.id}
						index={tile.index}
						type={tile.type}
						folderColor={folderTileMeta.color}
						folderId={folderId}
					/>
				) : (
					<EmptyTile
						key={tileIndex}
						folderColor={folderTileMeta.color}
						tileIndex={index + 0 * TILES_PER_PAGE}
						folderId={folderId}
					/>
				);
			})}
		</div>
	);
});

export default TileGrid;
