import {
	TILES_PER_PAGE,
	TileSlot,
} from '@/contexts/tile_locations/useTileFolder';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { TileColor } from '@/helpers/tileColors';
import { memo } from 'react';
import TileAction from './TileAction';
import TileAnimationWrapper from './TileAnimationWrapper';
import TileBackground from './TileBackground';
import TileImage from './TileImage';
import TileTooltip from './TileTooltip';

type Props = Omit<TileSlot, 'folderId'> & {
	folderColor?: TileColor;
};

const Tile = memo(function Tile({
	index,
	id,
	type,
	folderColor = TileColor.Green,
}: Props) {
	const { tileMeta } = useTileMeta(id);
	const firstRow = index % TILES_PER_PAGE < 5;

	return (
		<TileAnimationWrapper>
			<TileBackground
				type={type}
				color={type === 'folder' ? tileMeta.color : folderColor}
			>
				{/* tile image */}
				<TileImage id={id} type={type} />

				{/* action */}
				<TileAction action='Open' />
			</TileBackground>

			{/* title tooltip */}
			<TileTooltip position={firstRow ? 'below' : 'above'}>
				{tileMeta.name}
			</TileTooltip>
		</TileAnimationWrapper>
	);
});

export default Tile;
