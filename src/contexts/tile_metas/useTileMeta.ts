import { DEFAULT_MAIN_META, TileMeta } from '@/helpers/json/tileMeta';
import useTileMetas from './useTileMetas';
import { useTileMetasDispatch } from './useTileMetasDispatch';

export function useTileMeta(id: string): {
	tileMeta: TileMeta;
	setTileMeta: (data: TileMeta) => void;
} {
	const tileMetas = useTileMetas();
	const { set } = useTileMetasDispatch();

	if (!id) throw new Error('useTileMeta used with an invalid ID!');

	const tile = tileMetas[id];
	if (!tile) {
		return {
			tileMeta: DEFAULT_MAIN_META,
			setTileMeta: () => {},
		};
	}

	return {
		tileMeta: tile,
		setTileMeta: (meta: TileMeta) => {
			set(id, meta);
		},
	};
}
