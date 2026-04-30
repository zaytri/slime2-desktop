import { useDialog } from '@/contexts/dialog/useDialog';
import { TileColor } from '@/helpers/tileColors';
import { memo } from 'react';
import CreateTileDialog from '../../../../components/dialog/CreateTileDialog';
import CirclePlusSvg from '../../../../components/svg/CirclePlusSvg';
import TileAction from './TileAction';
import TileAnimationWrapper from './TileAnimationWrapper';
import TileBackground from './TileBackground';

type EmptyTileProps = {
	folderColor?: TileColor;
	tileIndex: number;
	folderId: string;
};

const EmptyTile = memo(function EmptyTile({
	folderColor = TileColor.Green,
	tileIndex,
	folderId,
}: EmptyTileProps) {
	const { openDialog } = useDialog();

	return (
		<button
			type='button'
			className='group flex items-center justify-center'
			onClick={() => {
				openDialog(<CreateTileDialog folderId={folderId} index={tileIndex} />);
			}}
		>
			<TileAnimationWrapper>
				<TileBackground type='empty' color={folderColor}>
					{/* action */}
					<TileAction action='Create' />
				</TileBackground>

				{/* empty tile icon */}
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='relative mb-10 size-12 origin-bottom scale-0 text-amber-200 transition-transform group-over:scale-100'>
						<div className='absolute inset-2.5 rounded-100% bg-linear-to-b from-amber-800 to-amber-900'></div>
						<CirclePlusSvg className='relative' />
					</div>
				</div>
			</TileAnimationWrapper>
		</button>
	);
});

export default EmptyTile;
