import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { getTileIconSrc } from '@/helpers/media';
import type { TileSlot } from '@@/json/tileLocations';
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
				className='flex-1 rounded-10% object-contain smooth-image'
			/>
		</div>
	);
});

export default TileImage;
