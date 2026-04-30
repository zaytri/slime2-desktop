import type { TileSlot } from '@@/json/tileLocations';
import { useEffect, useState } from 'react';
import { useTileLocationsDispatch } from '../tile_locations/useTileLocationsDispatch';
import { TileSwapContext } from './useTileSwap';

export default function TileSwapProvider({ children }: Props.WithChildren) {
	const { swapTile } = useTileLocationsDispatch();
	const [sourceSlot, setSourceSlot] = useState<TileSlot | null>(null);

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			setSourceSlot(null);
		}
	}

	useEffect(() => {
		if (sourceSlot) {
			addEventListener('keydown', onKeyDown);
		}

		return () => {
			removeEventListener('keydown', onKeyDown);
		};
	}, [sourceSlot]);

	function onSwap(destinationSlot: TileSlot) {
		if (!sourceSlot) return;

		swapTile(
			sourceSlot.id,
			destinationSlot.type === 'empty' ? undefined : destinationSlot.id,
			destinationSlot.index,
			destinationSlot.folderId,
		);

		setSourceSlot(null);
	}

	return (
		<TileSwapContext
			value={{
				sourceSlot,
				setSourceSlot,
				onSwap,
			}}
		>
			{children}
		</TileSwapContext>
	);
}
