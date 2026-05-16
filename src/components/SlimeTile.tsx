import WaveSvg from '@/components/svg/WaveSvg';
import { TileColor, tileColorClasses } from '@/helpers/tileColors';
import type { TileSlot } from '@@/json/tileLocations';
import clsx from 'clsx';
import { type PropsWithChildren } from 'react';

type SlimeTileProps = {
	type: TileSlot['type'];
	color?: TileColor;
};

export default function SlimeTile({
	type,
	color,
	children,
}: PropsWithChildren<SlimeTileProps>) {
	return (
		<div
			className={clsx(
				'relative size-full overflow-hidden bg-linear-to-b shadow-[inset_0_0_0_1px_#FFF6,inset_0_-5px_20px_5px_#FFF4] after:rounded-100%',
				color && tileColorClasses[color],
				type === 'widget' && 'rounded-slime',
				type === 'folder' && 'rounded-10%',
				type === 'empty' &&
					'h-3/4 rounded-slime bg-none transition-[border-radius,height] group-over:h-5/6',
			)}
		>
			{/* wave svg */}
			<div
				className={clsx(
					'absolute inset-0 bg-black text-white mix-blend-overlay',
					type === 'empty' ? 'opacity-10' : 'opacity-20',
				)}
			>
				<WaveSvg />
			</div>

			{/* gradient */}
			<div className='absolute inset-0 bg-linear-to-b from-white opacity-25'></div>

			{children}
		</div>
	);
}
