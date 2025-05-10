import WaveSvg from '@/components/svg/WaveSvg';
import { TileSlot } from '@/contexts/tile_locations/useTileFolder';
import { TileColor, tileColorClasses } from '@/helpers/tileColors';
import clsx from 'clsx';
import { memo, type PropsWithChildren } from 'react';

type Props = {
	type: TileSlot['type'];
	color?: TileColor;
};

const TileBackground = memo(function TileBackground({
	type,
	color = TileColor.Green,
	children,
}: PropsWithChildren<Props>) {
	return (
		<div
			className={clsx(
				'after:rounded-100% absolute inset-0 overflow-hidden border-4 border-black/25 bg-lime-400/75 shadow-[inset_0_-3px_10px_5px] shadow-white/25 backdrop-blur-xs after:absolute after:top-[10%] after:left-[28%] after:h-4 after:w-2 after:rotate-[60deg] after:bg-white after:mix-blend-overlay after:content-[""]',
				tileColorClasses[color].bg75,
				type === 'widget' && 'rounded-slime',
				type === 'folder' &&
					'rounded-10% after:top-0.5! after:left-3! after:rotate-[75deg]',
				type === 'empty' &&
					'rounded-slime group-over:scale-y-100 origin-bottom scale-y-75 transition-[border-radius,transform]',
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

export default TileBackground;
