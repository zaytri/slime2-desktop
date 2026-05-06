import HeaderBackButton from '@/components/header/HeaderBackButton';
import HeaderButton from '@/components/header/HeaderButton';
import HeaderIcon from '@/components/header/HeaderIcon';
import { useFolderId } from '@/contexts/folder_id/useFolderId';
import useTileLocation from '@/contexts/tile_locations/useTileLocation';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import useWidgetsPanel from '@/contexts/widgets_panel/useWidgetsPanel';
import { getTileIconSrc } from '@/helpers/media';
import useEditTile from '@/hooks/useEditTile';
import PencilSvg from '@@/svg/PencilSvg';

export default function FolderHeader() {
	const { folderId } = useFolderId();
	const { onBackFolder } = useWidgetsPanel();
	const { tileMeta } = useTileMeta(folderId);
	const tileLocation = useTileLocation(folderId);
	const editTile = useEditTile();

	if (folderId === 'main') return null;

	return (
		<header className='flex items-center gap-3 dark-container p-4'>
			<HeaderBackButton
				onClick={() => {
					onBackFolder(tileLocation.index);
				}}
			/>

			{tileMeta.icon && (
				<HeaderIcon src={getTileIconSrc(folderId, tileMeta.icon)} />
			)}

			<h1 className='line-clamp-1 flex-1 font-mochiy text-5 text-white text-shadow-[0_2px_black]'>
				{tileMeta.name}
			</h1>

			<HeaderButton
				label='Edit'
				icon={PencilSvg}
				className='border-cyan-300 bg-cyan-300 from-cyan-300 to-sky-400 text-sky-900 over:outline-cyan-600'
				onClick={() => {
					editTile(folderId, 'folder');
				}}
			/>
		</header>
	);
}
