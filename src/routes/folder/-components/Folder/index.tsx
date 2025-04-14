import bg from '@/assets/bliss.jpg';
import HeaderButton from '@/components/TileSettingsButton';
import Header from '@/components/header/Header';
import HeaderText from '@/components/header/HeaderText';
import ArrowLeftSvg from '@/components/svg/ArrowLeftSvg';
import GearSvg from '@/components/svg/GearSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import { PAGES_PER_FOLDER } from '@/contexts/tile_locations/useTileFolder';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { getTileIconUrl } from '@/helpers/media';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import { memo, useCallback, useState } from 'react';
import ChangePageButton from './ChangePageButton';
import ExitFolderButton from './ExitFolderButton';
import TileGrid from './TileGrid';

type FolderProps = {
	folderId: string;
};

const Folder = memo(function Folder({ folderId }: FolderProps) {
	const { tileMeta } = useTileMeta(folderId);
	const { open } = useDialog();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const changePage = useCallback(
		(action: 'previous' | 'next') => {
			const newIndex =
				action === 'previous' ? selectedIndex - 1 : selectedIndex + 1;
			setSelectedIndex((newIndex + PAGES_PER_FOLDER) % PAGES_PER_FOLDER);
		},
		[selectedIndex],
	);

	const pageIndices = [...Array(PAGES_PER_FOLDER).keys()];
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
						src={getTileIconUrl(folderId, tileMeta.icon)}
						className='rounded-2 smooth-image h-10 w-12 border-2 border-amber-900 object-cover'
					/>
				)}

				<HeaderText className='flex-1'>{tileMeta.name}</HeaderText>

				{isCustomFolder && (
					<HeaderButton
						icon={<GearSvg className='size-7' />}
						onClick={() => {
							open({
								name: 'TileSettings',
								payload: { id: folderId },
							});
						}}
					>
						Tile Settings
					</HeaderButton>
				)}

				<div className='flex items-center'>
					<TabList className='relative flex items-center justify-end gap-1 rounded-full outline-offset-4 after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:outline-offset-[6px] after:outline-white after:content-[""] has-data-focus:outline-2 has-data-focus:after:outline'>
						<span className='sr-only'>Page Selector</span>
						{pageIndices.map(index => {
							return (
								<Tab
									key={index}
									className={clsx(
										'group flex size-7 items-center justify-center rounded-full border-2 border-amber-900 bg-amber-600 bg-linear-to-b from-amber-700 to-amber-600 outline-hidden transition-[width,height] data-hover:from-amber-700 data-hover:to-amber-900 data-selected:size-10 data-selected:from-amber-700 data-selected:to-amber-900 data-selected:text-xl',
									)}
								>
									<span className='sr-only text-amber-100 group-data-hover:not-sr-only group-data-selected:not-sr-only'>
										{index + 1}
									</span>
								</Tab>
							);
						})}
					</TabList>
				</div>
			</Header>

			<div className='relative flex flex-1 flex-col'>
				<img src={bg} className='absolute inset-0 h-full w-full object-cover' />

				<TabPanels className='flex flex-1'>
					{pageIndices.map(index => {
						return (
							// tabIndex of -1 prevents it from being tab focusable
							// so that pressing tab goes directly to the contents instead
							// TabPanel normally sets the active panel to tabIndex 0
							<TabPanel
								key={index}
								tabIndex={-1}
								className='data-selected:animate-page flex flex-1 flex-col'
							>
								<div className='flex flex-1 px-3 py-6'>
									<TileGrid folderId={folderId} page={index} />
								</div>
							</TabPanel>
						);
					})}
				</TabPanels>
				<div className='relative flex justify-between'>
					<ChangePageButton
						direction='left'
						onClick={() => changePage('previous')}
					/>
					{isCustomFolder && <ExitFolderButton />}
					<ChangePageButton
						direction='right'
						onClick={() => changePage('next')}
					/>
				</div>
			</div>
		</TabGroup>
	);
});

export default Folder;
