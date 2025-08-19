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

	if (!tileMeta.icon) return null;

	return (
		<div
			className={clsx(
				'absolute inset-x-2 top-5 bottom-2 flex',
				type === 'widget' && 'px-4 py-1',
			)}
		>
			<img
				src={getTileIconSrc(id, tileMeta.icon)}
				className='smooth-image flex-1 object-contain rounded-10% '
			/>
		</div>
	);
});

export default TileImage;
