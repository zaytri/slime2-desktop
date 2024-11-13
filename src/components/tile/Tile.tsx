import { SLOTS_PER_PAGE, type Tile } from '@/contexts/tile_grid/useTileGrid';
import { useTile } from '@/contexts/tile_map/useTileMap';
import clsx from 'clsx';
import { memo } from 'react';
import WaveSvg from '../svg/WaveSvg';
import TileTooltip from '../tile/TileTooltip';
import WidgetTile from '../tile/WidgetTile';
import EmptyTile from './EmptyTile';
import TileAction from './TileAction';

export default memo(function Tile(props: Tile) {
	const { index, id, type } = props;
	const tile = useTile(id);
	const firstRow = index % SLOTS_PER_PAGE < 5;

	return (
		<div
			className={clsx(
				'absolute inset-0 transition-transform duration-200 ease-bounce group-over:z-10 group-over:scale-125',
			)}
		>
			<div
				className={clsx(
					'absolute inset-0 overflow-hidden border-4 border-black/25 bg-lime-400/75 shadow-[inset_0_-3px_10px_5px] shadow-white/25 backdrop-blur-sm after:absolute after:left-11 after:top-2 after:h-4 after:w-2 after:rotate-[60deg] after:rounded-100% after:bg-white after:mix-blend-overlay after:content-[""]',
					type === 'widget' && 'rounded-slime',
					type === 'folder' &&
						'rounded-10% after:!top-0.5 after:left-3 after:rotate-[75deg]',
					type === null &&
						'origin-bottom scale-y-75 transition-[border-radius,transform] rounded-slime group-over:scale-y-100',
				)}
			>
				{/* wave svg */}
				<div className='absolute inset-0 bg-black text-white opacity-25 mix-blend-overlay'>
					<WaveSvg />
				</div>

				{/* actual contents */}
				{id && type ? <WidgetTile id={id} type={type} /> : <EmptyTile />}

				{/* action */}
				<TileAction action={id ? 'Open' : 'Create'} />
			</div>

			{/* title tooltip */}
			{id && (
				<TileTooltip position={firstRow ? 'below' : 'above'}>
					{tile?.name}
				</TileTooltip>
			)}
		</div>
	);
});
