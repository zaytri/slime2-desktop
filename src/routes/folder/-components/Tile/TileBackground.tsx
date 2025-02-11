import WaveSvg from '@/components/svg/WaveSvg';
import { type Tile } from '@/contexts/tile_grid/useTileGrid';
import { TileColor, tileColorClasses } from '@/helpers/ui';
import clsx from 'clsx';
import { memo, type PropsWithChildren } from 'react';

type Props = {
	type: Tile['type'];
	color?: TileColor;
};

export default memo(function TileBackground({
	type,
	color = TileColor.Green,
	children,
}: PropsWithChildren<Props>) {
	return (
		<div
			className={clsx(
				'absolute inset-0 overflow-hidden border-4 border-black/25 bg-lime-400/75 shadow-[inset_0_-3px_10px_5px] shadow-white/25 backdrop-blur-sm after:absolute after:left-[28%] after:top-[10%] after:h-4 after:w-2 after:rotate-[60deg] after:rounded-100% after:bg-white after:mix-blend-overlay after:content-[""]',
				tileColorClasses[color].bg75,
				type === 'widget' && 'rounded-slime',
				type === 'folder' &&
					'rounded-10% after:!left-3 after:!top-0.5 after:rotate-[75deg]',
				type === null &&
					'origin-bottom scale-y-75 transition-[border-radius,transform] rounded-slime group-over:scale-y-100',
			)}
		>
			{/* wave svg */}
			<div className='absolute inset-0 bg-black text-white opacity-25 mix-blend-overlay'>
				<WaveSvg />
			</div>

			{children}
		</div>
	);
});
