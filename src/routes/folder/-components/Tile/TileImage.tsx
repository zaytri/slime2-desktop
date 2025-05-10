import { TileSlot } from '@/contexts/tile_locations/useTileFolder';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { getTileIconSrc } from '@/helpers/media';
import clsx from 'clsx';
import { memo } from 'react';

type WidgetTileProps = {
	id: string;
	type: NonNullable<TileSlot['type']>;
};

const TileImage = memo(function TileImage({ id, type }: WidgetTileProps) {
	const { tileMeta } = useTileMeta(id);

	return (
		<div className='absolute inset-x-2 top-5 bottom-2 flex'>
			<img
				src={getTileIconSrc(id, tileMeta.icon)}
				className={clsx(
					'smooth-image flex-1 border-2 border-black/25 object-cover',
					type === 'widget' ? 'rounded-slime' : 'rounded-10%',
				)}
			/>
		</div>
	);
});

export default TileImage;
