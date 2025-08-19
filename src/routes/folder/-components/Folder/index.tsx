import bg from '@/assets/bliss.jpg';
import Header from '@/components/header/Header';
import HeaderButton from '@/components/header/HeaderButton';
import HeaderText from '@/components/header/HeaderText';
import ArrowLeftSvg from '@/components/svg/ArrowLeftSvg';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { getTileIconSrc } from '@/helpers/media';
import { TabGroup } from '@headlessui/react';
import { memo, useState } from 'react';
import TileGrid from './TileGrid';

type FolderProps = {
	folderId: string;
};

const Folder = memo(function Folder({ folderId }: FolderProps) {
	const { tileMeta } = useTileMeta(folderId);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const isCustomFolder = folderId !== 'main';

	return (
		<TabGroup
			className='flex flex-1 flex-col'
			selectedIndex={selectedIndex}
			onChange={setSelectedIndex}
		>
			<Header className='w-full items-center gap-2 p-3'>
				{isCustomFolder && (
					<HeaderButton icon={<ArrowLeftSvg className='size-7' />} linkTo='/'>
						Back
					</HeaderButton>
				)}

				{tileMeta.icon && (
					<img
						src={getTileIconSrc(folderId, tileMeta.icon)}
						className='rounded-2 smooth-image h-10 w-12 object-contain'
					/>
				)}

				<HeaderText className='flex-1'>{tileMeta.name}</HeaderText>
			</Header>

			<div className='relative flex flex-1 flex-col'>
				<img src={bg} className='absolute inset-0 h-full w-full object-cover' />

				<div className='flex flex-1 px-3 py-6'>
					<TileGrid folderId={folderId} />
				</div>
			</div>
		</TabGroup>
	);
});

export default Folder;
