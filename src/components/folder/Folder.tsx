import { useDialog } from '@/contexts/dialog/useDialog';
import { useTile } from '@/contexts/tile_map/useTileMap';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { memo, useCallback, useState } from 'react';
import bg from '../../assets/bliss.jpg';
import Header from '../header/Header';
import HeaderText from '../header/HeaderText';
import DownSvg from '../svg/DownSvg';
import LeftSvg from '../svg/LeftSvg';
import PencilSvg from '../svg/PencilSvg';
import RightSvg from '../svg/RightSvg';
import FolderPage from './FolderPage';
type FolderProps = {
	folderId: string;
};

const TOTAL_PAGES = 5;

export default memo(function Folder({ folderId }: FolderProps) {
	const tile = useTile(folderId);
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
				<HeaderText className='flex items-center gap-1 p-3'>
					<span className='line-clamp-1'>{tile?.name}</span>
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
				</HeaderText>
				<div className='flex flex-1 items-end justify-end px-3'>
					<TabList className='relative flex items-end justify-end gap-1 rounded-t outline-2 outline-offset-4 after:pointer-events-none after:absolute after:inset-0 after:rounded-t after:outline-1 after:outline-offset-[6px] after:outline-white after:content-[""] has-[[data-focus]]:outline has-[[data-focus]]:after:outline'>
						<span className='sr-only'>Page Selector</span>
						{pageIndices.map(index => {
							return (
								<Tab
									key={index}
									className={clsx(
										'group flex h-7 w-8 items-end justify-center rounded-t-lg bg-amber-600 bg-gradient-to-b from-amber-700 to-amber-600 outline-none transition-[width,height] data-[selected]:w-12 data-[hover]:from-amber-700 data-[selected]:from-amber-700 data-[hover]:to-amber-900 data-[selected]:to-amber-900',
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
									<FolderPage folderId={folderId} page={index} />
								</div>
							</TabPanel>
						);
					})}
				</TabPanels>
				<div className='relative flex justify-between'>
					<ArrowButton
						direction='left'
						onClick={() => changePage('previous')}
					/>
					{isCustomFolder && (
						<Link
							to='/'
							className='group flex h-16 origin-bottom items-center gap-0 rounded-t-2xl border-4 border-b-0 border-amber-900 bg-amber-300 bg-gradient-to-b from-amber-200 from-50% to-amber-300 to-50% px-8 font-fredoka text-[.1px] font-medium text-amber-900 transition-[gap,transform] over:scale-125 over:gap-4 over:bg-none over:text-3xl'
						>
							<DownSvg className='size-8' />
							<span className='opacity-0 transition-[font-size,opacity] group-over:opacity-100'>
								Exit Folder
							</span>
						</Link>
					)}
					<ArrowButton direction='right' onClick={() => changePage('next')} />
				</div>
			</div>
		</TabGroup>
	);
});

type ArrowButtonProps = {
	direction: 'left' | 'right';
	onClick: () => void;
};

const ArrowButton = memo(function ArrowButton({
	direction,
	onClick,
}: ArrowButtonProps) {
	const children = (
		<div className='flex items-center gap-0 pt-1 font-fredoka text-[.1px] font-medium transition-[gap] group-over:gap-4 group-over:text-3xl'>
			{direction === 'left' ? (
				<>
					<LeftSvg className='size-8' />
					<span className='pb-1 opacity-0 transition-[font-size,opacity] group-over:opacity-100'>
						Previous<span className='sr-only'> Page</span>
					</span>
				</>
			) : (
				<>
					<span className='pb-1 opacity-0 transition-[font-size,opacity] group-over:opacity-100'>
						Next<span className='sr-only'> Page</span>
					</span>
					<RightSvg className='size-8' />
				</>
			)}
		</div>
	);

	return (
		<button
			type='button'
			className={clsx(
				'group flex h-16 items-center border-t-4 border-amber-900 bg-amber-300 bg-gradient-to-b from-amber-200 from-50% to-amber-300 to-50% px-6 text-amber-900 transition-transform over:scale-125 over:bg-none',
				direction === 'left'
					? 'origin-bottom-left justify-start rounded-tr-2xl border-r-4'
					: 'origin-bottom-right justify-end rounded-tl-2xl border-l-4',
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
});
