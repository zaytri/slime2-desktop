import { TileMeta } from '@/helpers/json/tileMeta';
import { TileColor } from '@/helpers/tileColors';
import useTileMetas from './useTileMetas';
import { useTileMetasDispatch } from './useTileMetasDispatch';

const DEFAULT_MAIN_META: TileMeta = {
	name: 'Widgets',
	color: TileColor.Green,
	icon: '',
};

export function useTileMeta(id: string): {
	tileMeta: TileMeta;
	setTileMeta: (data: TileMeta) => void;
} {
	const tileMetas = useTileMetas();
	const { set } = useTileMetasDispatch();

	if (!id) throw new Error('useTileMeta used with an invalid ID!');

	if (id === 'main') {
		return {
			tileMeta: DEFAULT_MAIN_META,
			setTileMeta: () => {},
		};
	}

	const tile = tileMetas[id];

	if (!tile) throw new Error(`Tile with ID ${id} not found!`);

	return {
		tileMeta: tile,
		setTileMeta: (meta: TileMeta) => {
			set(id, meta);
		},
	};
}
