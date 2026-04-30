import slime2tv from '@/assets/slime2tv.png';
import WaveSvg from '@/components/svg/WaveSvg';
import AccountServiceTag from '@/components/tag/AccountServiceTag';
import Tag from '@/components/tag/Tag';
import WidgetTypeTag from '@/components/tag/WidgetTypeTag';
import { useFolderId } from '@/contexts/folder_id/useFolderId';
import useSelectedTile from '@/contexts/selected_tile/useSelectedTile';
import useTileFolder from '@/contexts/tile_locations/useTileFolder';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import useTileSwap from '@/contexts/tile_swap/useTileSwap';
import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import useWidgetsPanel from '@/contexts/widgets_panel/useWidgetsPanel';
import { getTileIconSrc } from '@/helpers/media';
import { tileColorClasses } from '@/helpers/tileColors';
import type { TileSlot } from '@@/json/tileLocations';
import type { TileMeta } from '@@/json/tileMeta';
import ArrowLeftSvg from '@@/svg/ArrowLeftSvg';
import ArrowRightSvg from '@@/svg/ArrowRightSvg';
import GridSvg from '@@/svg/GridSvg';
import clsx from 'clsx';

export default function FolderSidebar() {
	const { onPageLeft, onPageRight, page } = useWidgetsPanel();
	const { selectedTile, selectedTileMeta } = useSelectedTile();

	return (
		<aside className='row-span-4 flex flex-2 flex-col items-center dark-container p-4 pt-8'>
			<div className='flex w-full flex-1 flex-col items-center gap-4'>
				<SelectedTilePreview tile={selectedTile} tileMeta={selectedTileMeta} />
				<div className='flex w-full items-center justify-between border-t border-zinc-500 pt-4 text-zinc-200'>
					<button
						type='button'
						className='group/nav rounded-1 p-2 text-white outline-offset-0! over:text-green-200 over:outline-4 over:outline-green-400'
						onClick={onPageLeft}
					>
						<ArrowLeftSvg className='size-7 drop-shadow-[0_2px_black] group-over/nav:drop-shadow-none' />
						<p className='sr-only'>Previous Page</p>
					</button>

					<p className='text-5 font-bold text-white'>Page {page + 1}</p>

					<button
						type='button'
						className='group/nav rounded-1 p-2 text-white outline-offset-0! over:text-green-200 over:outline-4 over:outline-green-400'
						onClick={onPageRight}
					>
						<ArrowRightSvg className='size-7 drop-shadow-[0_2px_black] group-over/nav:drop-shadow-none' />
						<p className='sr-only'>Next Page</p>
					</button>
				</div>
			</div>
		</aside>
	);
}

type SelectedTilePreviewProps = {
	tile?: TileSlot;
	tileMeta?: TileMeta;
};

function SelectedTilePreview({ tile, tileMeta }: SelectedTilePreviewProps) {
	const { folderId } = useFolderId();
	const { tileMeta: folderTileMeta } = useTileMeta(folderId);
	const { sourceSlot } = useTileSwap();
	const movingTileMode = !!sourceSlot;

	if (!tile) {
		return (
			<div className='flex flex-1 flex-col items-center gap-2 font-bold text-white text-shadow-[0_2px_black]'>
				<h1 className='text-6'>Welcome to Slime2!</h1>
				<img className='h-48' src={slime2tv}></img>
				<p>Select a slime tile to get started</p>
			</div>
		);
	}

	if (!tileMeta) {
		return (
			<div className='flex flex-1 flex-col items-center gap-2 font-bold text-white text-shadow-[0_2px_black]'>
				{movingTileMode ? (
					<p className='text-center text-5'>Move into this empty slot?</p>
				) : (
					<>
						<h2 className='text-6'>Click to create!</h2>
						<img className='h-48' src={slime2tv}></img>

						<div className='flex flex-1 items-end'>
							<em className='text-3.5 font-bold text-white text-shadow-[0_2px_black]'>
								Left Click to Create a Widget / Folder
							</em>
						</div>
					</>
				)}
			</div>
		);
	}

	return (
		<div className='flex w-full flex-1 flex-col items-center gap-4'>
			{movingTileMode && (
				<p className='text-center text-5 font-bold text-white text-shadow-[0_2px_black]'>
					{sourceSlot.id === tile.id
						? `Moving this ${tile.type}...`
						: `Swap with this ${tile.type}?`}
				</p>
			)}

			<div
				className={clsx(
					'relative flex w-4/5 items-center justify-center rounded-2 bg-linear-to-b ring-2 ring-black/50 outline-2 -outline-offset-2 outline-white/50',
					tileColorClasses[
						tile.type === 'folder' ? tileMeta.color : folderTileMeta.color
					],
				)}
			>
				{/* wave svg */}
				<div className='absolute inset-0 bg-black text-white opacity-20 mix-blend-overlay'>
					<WaveSvg />
				</div>
				<div className='relative flex aspect-4/3 w-full items-center justify-center p-4'>
					<img
						className='max-h-full max-w-full rounded-1 object-contain smooth-image'
						src={getTileIconSrc(tile.id, tileMeta.icon)}
					/>
				</div>
			</div>

			<h2 className='line-clamp-2 text-center text-5 font-bold text-white text-shadow-[0_2px_black]'>
				{tileMeta.name}
			</h2>
			{tile.type === 'widget' && <WidgetTags widgetId={tile.id} />}
			{tile.type === 'folder' && <FolderTags folderId={tile.id} />}

			{!movingTileMode && (
				<div className='flex flex-1 items-end'>
					<em className='flex flex-1 items-center gap-2 text-3.5 font-bold text-white text-shadow-[0_2px_black]'>
						<span>Left Click to Open</span>
						<span>-</span>
						<span>Right Click for More</span>
					</em>
				</div>
			)}
		</div>
	);
}

type WidgetTagsProps = {
	widgetId: string;
};

function WidgetTags({ widgetId }: WidgetTagsProps) {
	const { widgetMeta } = useWidgetMeta(widgetId);
	const accounts = widgetMeta?.accounts || [];
	const type = widgetMeta?.type || [];

	const usesService = {
		twitch: false,
		youtube: false,
	};

	accounts.forEach(account => {
		switch (account.service) {
			case 'twitch':
				usesService.twitch = true;
				break;
			case 'youtube':
				usesService.youtube = true;
				break;
			default: // nothing
		}
	});

	return (
		<div className='flex gap-3 rounded-2 font-bold *:outline-2 *:outline-white'>
			{usesService.twitch && <AccountServiceTag service='twitch' />}
			{usesService.youtube && <AccountServiceTag service='youtube' />}
			{type.includes('bot') && <WidgetTypeTag type='bot' />}
			{type.includes('overlay') && <WidgetTypeTag type='overlay' />}
		</div>
	);
}

type FolderTagsProps = {
	folderId: string;
};

function FolderTags({ folderId }: FolderTagsProps) {
	const { widgetCount } = useTileFolder(folderId);

	return (
		<div className='flex gap-3 rounded-2 font-bold *:outline-2 *:outline-white'>
			<Tag
				label='Folder'
				icon={<GridSvg className='size-4' />}
				className='border-amber-800 bg-amber-700'
			/>
			<Tag
				label={`Widget${widgetCount !== 1 ? 's' : ''}`}
				icon={
					<p className='-mt-1 -mb-1.5 text-4.5 font-extrabold'>{widgetCount}</p>
				}
				className='border-slate-700 bg-slate-600'
			/>
		</div>
	);
}
