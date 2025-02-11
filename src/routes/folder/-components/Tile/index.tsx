import { SLOTS_PER_PAGE, type Tile } from '@/contexts/tile_grid/useTileGrid';
import { useTile } from '@/contexts/tile_map/useTileMap';
import { TileColor } from '@/helpers/ui';
import clsx from 'clsx';
import { memo } from 'react';
import EmptyTile from './EmptyTile';
import TileAction from './TileAction';
import TileBackground from './TileBackground';
import TileImage from './TileImage';
import TileTooltip from './TileTooltip';

type Props = Tile & {
	folderColor?: TileColor;
};

export default memo(function Tile({
	index,
	id,
	type,
	folderColor = TileColor.Green,
}: Props) {
	const { tile } = useTile(id);
	const firstRow = index % SLOTS_PER_PAGE < 5;

	return (
		<div
			className={clsx(
				'absolute inset-0 transition-transform duration-200 ease-bounce group-over:z-10 group-over:scale-125',
			)}
		>
			<TileBackground
				type={type}
				color={type === 'folder' ? tile?.color : folderColor}
			>
				{/* tile image or empty tile icon */}
				{id && type ? <TileImage id={id} type={type} /> : <EmptyTile />}

				{/* action */}
				<TileAction action={id ? 'Open' : 'Create'} />
			</TileBackground>

			{/* title tooltip */}
			{id && (
				<TileTooltip position={firstRow ? 'below' : 'above'}>
					{tile?.name}
				</TileTooltip>
			)}
		</div>
	);
});
