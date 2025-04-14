import { TileColor } from '@/helpers/ui';
import { memo } from 'react';
import PlusSvg from '../../../../components/svg/PlusSvg';
import TileAction from './TileAction';
import TileAnimationWrapper from './TileAnimationWrapper';
import TileBackground from './TileBackground';

type Props = {
	folderColor?: TileColor;
};

const EmptyTile = memo(function EmptyTile({
	folderColor = TileColor.Green,
}: Props) {
	return (
		<TileAnimationWrapper>
			<TileBackground type='empty' color={folderColor}>
				{/* empty tile icon */}
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='group-over:scale-100 relative mb-10 size-12 origin-bottom scale-0 text-amber-200 transition-transform'>
						<div className='rounded-100% absolute inset-2.5 bg-linear-to-b from-amber-800 to-amber-900'></div>
						<PlusSvg className='relative' />
					</div>
				</div>

				{/* action */}
				<TileAction action='Create' />
			</TileBackground>
		</TileAnimationWrapper>
	);
});

export default EmptyTile;
