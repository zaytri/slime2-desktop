import type { TileSlot } from '@@/json/tileLocations';
import { useState } from 'react';
import useTileMetas from '../tile_metas/useTileMetas';
import { SelectedTileContext } from './useSelectedTile';

export default function SelectedTileProvider({ children }: Props.WithChildren) {
	const tileMetas = useTileMetas();
	const [selectedTile, setSelectedTile] = useState<TileSlot>();
	const selectedTileMeta =
		!selectedTile || selectedTile.type === 'empty'
			? undefined
			: tileMetas[selectedTile.id];

	return (
		<SelectedTileContext
			value={{ selectedTile, setSelectedTile, selectedTileMeta }}
		>
			{children}
		</SelectedTileContext>
	);
}
