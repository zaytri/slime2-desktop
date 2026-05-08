import HeaderButton from '@/components/header/HeaderButton';
import TileHeader from '@/components/header/TileHeader';
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

	if (folderId === 'main') return null;

	return (
		<TileHeader
			className='dark-container p-4'
			onBack={() => {
				onBackFolder(tileLocation.index);
			}}
			iconSrc={
				tileMeta.icon ? getTileIconSrc(folderId, tileMeta.icon) : undefined
			}
			name={tileMeta.name}
		>
			<EditButton />
		</TileHeader>
	);
}

function EditButton() {
	const { folderId } = useFolderId();
	const editTile = useEditTile();

	return (
		<HeaderButton
			label='Edit'
			icon={PencilSvg}
			className='border-cyan-300 bg-cyan-300 from-cyan-300 to-sky-400 text-sky-900 over:outline-cyan-600'
			onClick={() => {
				editTile(folderId, 'folder');
			}}
		/>
	);
}
