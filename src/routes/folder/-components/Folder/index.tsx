import bg from '@/assets/bliss.jpg';
import Header from '@/components/header/Header';
import HeaderText from '@/components/header/HeaderText';
import PencilSvg from '@/components/svg/PencilSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useTile } from '@/contexts/tile_map/useTileMap';
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

const TOTAL_PAGES = 5;

export default memo(function Folder({ folderId }: FolderProps) {
	const { tile } = useTile(folderId);
	const { open } = useDialog();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const changePage = useCallback(
		(action: 'previous' | 'next') => {
			const newIndex =
				action === 'previous' ? selectedIndex - 1 : selectedIndex + 1;
			setSelectedIndex((newIndex + TOTAL_PAGES) % TOTAL_PAGES);
		},
		[selectedIndex],
	);

	const pageIndices = [...Array(TOTAL_PAGES).keys()];
	const isCustomFolder = folderId !== 'main';

	return (
		<TabGroup
			className='flex flex-1 flex-col'
			selectedIndex={selectedIndex}
			onChange={setSelectedIndex}
		>
			<Header className='gap-1'>
				<div className='flex items-center gap-2 p-3'>
					{!!tile?.icon && (
						<img
							src={getTileIconUrl(folderId, tile.icon)}
							className='h-10 w-12 rounded-2 border-2 border-amber-900 object-cover smooth-image'
						/>
					)}
					<HeaderText className='line-clamp-1'>{tile?.name}</HeaderText>
					{isCustomFolder && (
						<button
							type='button'
							className='group flex h-8 items-center justify-center gap-0 rounded-lg px-2 text-amber-900 over:ml-1 over:gap-2 over:bg-amber-900 over:text-amber-200'
							onClick={() => {
								open({
									name: 'CustomizeFolder',
									payload: { id: folderId },
								});
							}}
						>
							<PencilSvg className='size-5' />
							<span className='text-[.1px] opacity-0 transition-[font-size] group-over:text-base group-over:opacity-100'>
								Customize
							</span>
						</button>
					)}
				</div>
				<div className='flex flex-1 items-center justify-end px-3'>
					<TabList className='relative flex items-center justify-end gap-1 rounded-full outline-2 outline-offset-4 after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:outline-1 after:outline-offset-[6px] after:outline-white after:content-[""] has-[[data-focus]]:outline has-[[data-focus]]:after:outline'>
						<span className='sr-only'>Page Selector</span>
						{pageIndices.map(index => {
							return (
								<Tab
									key={index}
									className={clsx(
										'group flex size-7 items-center justify-center rounded-full border-2 border-amber-900 bg-amber-600 bg-gradient-to-b from-amber-700 to-amber-600 outline-none transition-[width,height] data-[selected]:size-10 data-[hover]:from-amber-700 data-[selected]:from-amber-700 data-[hover]:to-amber-900 data-[selected]:to-amber-900 data-[selected]:text-xl',
									)}
								>
									<span className='sr-only text-amber-100 group-data-[hover]:not-sr-only group-data-[selected]:not-sr-only'>
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
								className='flex flex-1 flex-col data-[selected]:animate-page'
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
