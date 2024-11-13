import { useDialog } from '@/contexts/dialog/useDialog';
import {
	SLOTS_PER_PAGE,
	useTileFolder,
	useTileGridDispatch,
} from '@/contexts/tile_grid/useTileGrid';
import { deleteWidget } from '@/helpers/commands';
import { useNavigate } from '@tanstack/react-router';
import { memo } from 'react';
import Tile from '../tile/Tile';

type FolderPageProps = {
	folderId: string;
	page: number;
};

export default memo(function FolderPage({ folderId, page }: FolderPageProps) {
	const { getPage } = useTileFolder(folderId);
	const { removeItem } = useTileGridDispatch();
	const { open } = useDialog();
	const navigate = useNavigate();

	return (
		<div className='grid flex-1 grid-cols-5 gap-0'>
			{getPage(page).map((tile, index) => {
				const tileIndex = index + page * SLOTS_PER_PAGE;

				return (
					<button
						type='button'
						key={tileIndex}
						className='group flex items-center justify-center'
						onClick={async () => {
							if (tile.id) {
								if (tile.type === 'folder') {
									navigate({
										to: '/folder/$folderId',
										params: { folderId: tile.id },
									});
								} else {
									await deleteWidget(tile.id);
									removeItem(tile.id);
								}
							} else {
								open({
									name: 'Create',
									payload: { folderId, index: tileIndex },
								});
							}
						}}
					>
						<div className='relative h-32 w-36'>
							<Tile {...tile} />
						</div>
					</button>
				);
			})}
		</div>
	);
});
