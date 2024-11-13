import { type Tile } from '@/contexts/tile_grid/useTileGrid';
import { useTile } from '@/contexts/tile_map/useTileMap';
import clsx from 'clsx';
import { memo } from 'react';

type WidgetTileProps = {
	id: string;
	type: NonNullable<Tile['type']>;
};

export default memo(function WidgetTile({ id, type }: WidgetTileProps) {
	const tile = useTile(id);
	if (!tile) return null;

	return (
		<div className='absolute inset-x-2 bottom-2 top-5 flex'>
			<img
				src={`http://localhost:57140/tile/${id}/config/${tile.icon}`}
				className={clsx(
					'flex-1 border-2 border-black/25 object-cover',
					type === 'widget' ? 'rounded-slime' : 'rounded-10%',
				)}
			/>
		</div>
	);
});
