import SlimeTile from '@/components/SlimeTile';
import { useAccountsDispatch } from '@/contexts/accounts/useAccountsDispatch';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useFolderId } from '@/contexts/folder_id/useFolderId';
import useSelectedTile from '@/contexts/selected_tile/useSelectedTile';
import useTileFolder, {
	TILES_PER_PAGE,
} from '@/contexts/tile_locations/useTileFolder';
import useTileFolderPage from '@/contexts/tile_locations/useTileFolderPage';
import { useTileLocationsDispatch } from '@/contexts/tile_locations/useTileLocationsDispatch';
import useTileMetas from '@/contexts/tile_metas/useTileMetas';
import useTileSwap from '@/contexts/tile_swap/useTileSwap';
import useWidgetsPanel from '@/contexts/widgets_panel/useWidgetsPanel';
import {
	copyWidget,
	createWidgetFolder,
	installCustomWidget,
	installDefaultWidget,
} from '@/helpers/commands';
import { getTileIconSrc } from '@/helpers/media';
import { TileColor } from '@/helpers/tileColors';
import useEditTile from '@/hooks/useEditTile';
import CreateTileDialog from '@@/dialog/CreateTileDialog';
import type { TileSlot } from '@@/json/tileLocations';
import type { TileMeta } from '@@/json/tileMeta';
import ArrowCrossSvg from '@@/svg/ArrowCrossSvg';
import ArrowLeftRightSvg from '@@/svg/ArrowLeftRightSvg';
import DoorOpenSvg from '@@/svg/DoorOpenSvg';
import DoubleSquareSvg from '@@/svg/DoubleSquareSvg';
import PencilSvg from '@@/svg/PencilSvg';
import { Menu, MenuItem, useMenuStore } from '@ariakit/react';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

const GRID_CONTAINER_ID = 'slime2_widget_grid';
const TILES_PER_ROW = 5;

export default function WidgetGrid() {
	const { folderId } = useFolderId();
	const { page } = useWidgetsPanel();
	const tileMetas = useTileMetas();
	const tiles = useTileFolderPage(folderId, page);
	const [newTileId, setNewTileId] = useState<string | null>(null);

	useEffect(() => {
		if (!newTileId) return;

		// for accessibility, focus the newly created tile
		const element = document.getElementById(getOpenButtonId(newTileId));
		element?.focus();
	}, [newTileId]);

	return (
		<section
			id={GRID_CONTAINER_ID}
			className='row-span-4 grid flex-5 grid-cols-5 items-center justify-center gap-4 pb-4'
		>
			{tiles.map(tile => {
				const tileMeta: TileMeta | undefined = tileMetas[tile.id];

				return (
					<TileWrapper
						key={tile.id}
						setNewTileId={setNewTileId}
						tile={tile}
						icon={tileMeta ? getTileIconSrc(tile.id, tileMeta.icon) : undefined}
						color={
							tile.type === 'empty'
								? undefined
								: tile.type === 'folder'
									? tileMeta?.color || TileColor.Green
									: // widget color is parent folder color
										tileMetas[folderId]?.color || TileColor.Green
						}
					/>
				);
			})}
		</section>
	);
}

type TileWrapperProps = {
	tile: TileSlot;
	icon?: string;
	color?: TileColor;
	setNewTileId: (id: string) => void;
};

function TileWrapper({ tile, icon, color, setNewTileId }: TileWrapperProps) {
	const { openDialog } = useDialog();
	const { onWidget, onFolder, setPage } = useWidgetsPanel();
	const { setSelectedTile } = useSelectedTile();
	const { addTile } = useTileLocationsDispatch();
	const menuStore = useMenuStore();
	const [menuAnchorRect, setMenuAnchorRect] = useState({ x: 0, y: 0 });
	const { setSourceSlot, sourceSlot, onSwap } = useTileSwap();
	const movingTileMode = !!sourceSlot;
	const { nextAvailableIndex } = useTileFolder(tile.folderId);
	const { copyWidgetAccounts } = useAccountsDispatch();
	const tileRef = useRef<HTMLDivElement | null>(null);
	const editTile = useEditTile();

	useEffect(() => {
		if (!tileRef.current || !sourceSlot || sourceSlot.id !== tile.id) return;

		// for accessibility, focus the current tile when starting to move tiles
		tileRef.current.focus();
	}, [sourceSlot]);

	function onOver() {
		setSelectedTile(tile);
	}

	function onArrowKey(
		currentIndex: number,
		key: string,
		targetClassName: string,
	) {
		const gridContainer = document.getElementById(GRID_CONTAINER_ID);
		if (!gridContainer) return;

		const currentRow = Math.floor(currentIndex / TILES_PER_ROW);
		let indexToFocus: number | null = null;

		switch (key) {
			case 'ArrowUp':
				// add TILES_PER_PAGE just to not deal with negatives
				indexToFocus =
					(currentIndex + TILES_PER_PAGE - TILES_PER_ROW) % TILES_PER_PAGE;
				break;
			case 'ArrowDown':
				indexToFocus = (currentIndex + TILES_PER_ROW) % TILES_PER_PAGE;
				break;
			case 'ArrowLeft':
				const rowOfPreviousIndex = Math.floor(
					(currentIndex - 1) / TILES_PER_ROW,
				);
				indexToFocus =
					rowOfPreviousIndex === currentRow
						? currentIndex - 1
						: currentIndex - 1 + TILES_PER_ROW;
				break;
			case 'ArrowRight':
				const rowOfNextIndex = Math.floor((currentIndex + 1) / TILES_PER_ROW);
				indexToFocus =
					rowOfNextIndex === currentRow
						? currentIndex + 1
						: currentIndex + 1 - TILES_PER_ROW;
				break;
			default: //nothing
		}

		if (indexToFocus !== null) {
			let elementToFocus: HTMLButtonElement | null = null;
			if (sourceSlot && indexToFocus === sourceSlot.index % TILES_PER_PAGE) {
				elementToFocus = gridContainer.querySelector(
					`[data-index="${indexToFocus}"]`,
				);
			} else {
				elementToFocus = gridContainer.querySelector(
					`[data-index="${indexToFocus}"] .${targetClassName}`,
				);
			}

			elementToFocus?.focus();
		}
	}

	return (
		<>
			<div
				className={clsx('group/tile relative flex h-full outline-none')}
				onPointerEnter={onOver}
				tabIndex={movingTileMode && sourceSlot.id === tile.id ? 0 : -1}
				data-index={tile.index % TILES_PER_PAGE}
				ref={tileRef}
				onKeyDown={event => {
					// only run this on this focused element
					if (document.activeElement !== event.currentTarget) return;

					onArrowKey(tile.index, event.key, 'move-button');
				}}
			>
				{/* Open/Create Tile Button */}
				<button
					type='button'
					id={getOpenButtonId(tile.id)}
					className='group open-button relative flex size-full outline-none'
					disabled={movingTileMode}
					onFocus={onOver}
					onKeyDown={event => {
						// only run this on this focused element
						if (document.activeElement !== event.currentTarget) return;

						onArrowKey(tile.index, event.key, 'open-button');
					}}
					onContextMenu={event => {
						if (movingTileMode || tile.type === 'empty') return;

						event.preventDefault();
						event.stopPropagation();
						setMenuAnchorRect({ x: event.clientX, y: event.clientY });
						menuStore.show();
					}}
					onClick={() => {
						switch (tile.type) {
							case 'widget':
								onWidget(tile.id);
								break;
							case 'folder':
								onFolder(tile.id);
								break;
							case 'empty':
							default:
								openDialog(
									'New Tile',
									<CreateTileDialog
										folderId={tile.folderId}
										onCreateFolder={async folderName => {
											const id = await createWidgetFolder(folderName);
											addTile({
												id,
												index: tile.index,
												folderId: tile.folderId,
											});
										}}
										onCreateDefaultWidget={async defaultWidgetId => {
											const id = await installDefaultWidget(defaultWidgetId);
											addTile({
												id,
												index: tile.index,
												folderId: tile.folderId,
											});
										}}
										onCreateCustomWidget={async zipPath => {
											const id = await installCustomWidget(zipPath);
											addTile({
												id,
												index: tile.index,
												folderId: tile.folderId,
											});
										}}
									/>,
								);
								break;
						}
					}}
				>
					<div
						className={clsx(
							'absolute top-1/5 right-1/10 bottom-0 left-1/10 flex origin-bottom scale-100 items-center justify-center rounded-2 outline-offset-4 outline-white transition-transform duration-200 ease-bounce group-focus-visible:outline-4 group-over:z-1 group-over:scale-125',
							tile.type === 'empty'
								? 'drop-shadow-[0_10px_5px_#0006]'
								: 'drop-shadow-[0_10px_5px_#0003]',
							movingTileMode && sourceSlot.id === tile.id && 'outline-4',
							movingTileMode &&
								'group-focus-within/tile:outline-4 group-hover/tile:outline-4 group-focus-visible/tile:ring-4 group-focus-visible/tile:ring-black',
						)}
					>
						<div className='relative flex size-full items-center justify-center'>
							<div className='absolute inset-0 m-auto flex aspect-9/8 max-h-full max-w-full items-end justify-center'>
								<SlimeTile type={tile.type} color={color} />
								{tile.type !== 'empty' && (
									<SlimeIcon src={icon} type={tile.type} />
								)}
							</div>
						</div>
					</div>
				</button>

				{movingTileMode && sourceSlot.id !== tile.id && (
					<div className='absolute inset-0 top-1/5 flex flex-col items-center justify-end gap-3 py-3 font-bold opacity-0 drop-shadow-[0_2px_#0003] group-focus-within/tile:opacity-100 group-hover/tile:opacity-100'>
						{/* don't allow opening folder if attempting to move a folder */}
						{tile.type === 'folder' && sourceSlot.type !== 'folder' && (
							<button
								disabled={!movingTileMode}
								className='move-button relative flex items-center gap-2 overflow-hidden rounded-2 border border-yellow-300 bg-yellow-200 bg-linear-to-b from-yellow-300 to-amber-400 px-2 py-1 font-bold text-amber-900 outline-2 outline-offset-0! outline-amber-800 over:bg-none over:text-amber-950 over:outline-4 over:-outline-offset-1!'
								onFocus={onOver}
								onKeyDown={event => {
									// only run this on this focused element
									if (document.activeElement !== event.currentTarget) return;

									onArrowKey(tile.index, event.key, 'move-button');
								}}
								onClick={() => {
									onFolder(tile.id);
								}}
							>
								<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
								<div className='relative flex flex-1 items-center justify-center gap-2.5 drop-shadow-[0_1px_3px_#FFFB]'>
									<DoorOpenSvg className='h-5' />
									<p>Open</p>
								</div>
							</button>
						)}

						<button
							disabled={!movingTileMode}
							type='button'
							className={clsx(
								'move-button relative flex items-center gap-2 overflow-hidden rounded-2 border border-cyan-300 bg-cyan-200 bg-linear-to-b from-cyan-300 to-sky-400 px-2 py-1 font-bold text-sky-800 outline-2 outline-offset-0! outline-sky-800 over:bg-none over:text-sky-900 over:outline-4 over:-outline-offset-1!',
							)}
							onFocus={onOver}
							onKeyDown={event => {
								// only run this on this focused element
								if (document.activeElement !== event.currentTarget) return;

								onArrowKey(tile.index, event.key, 'move-button');
							}}
							onClick={() => {
								onSwap(tile);
							}}
						>
							<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20'></div>
							<div className='relative flex flex-1 items-center justify-center gap-2.5 drop-shadow-[0_1px_3px_#FFFB]'>
								<ArrowLeftRightSvg className='w-5' />
								<p>{tile.type === 'empty' ? 'Move' : 'Swap'}</p>
							</div>
						</button>
					</div>
				)}
			</div>

			<Menu
				store={menuStore}
				modal
				className='dark-menu'
				getAnchorRect={() => {
					return menuAnchorRect;
				}}
			>
				{/* Edit Button */}
				<MenuItem
					className='dark-menu-item'
					onClick={() => {
						// shouldn't happen but just in case...
						if (tile.type === 'empty') return;

						editTile(tile.id, tile.type);
					}}
				>
					<PencilSvg className='size-4' />
					<p>Edit</p>
				</MenuItem>

				{/* Move Button */}
				<MenuItem
					className='dark-menu-item'
					onClick={() => {
						// shouldn't happen but just in case...
						if (tile.type === 'empty') return;

						setSourceSlot(tile);
					}}
				>
					<ArrowCrossSvg className='size-4' />
					<p>Move</p>
				</MenuItem>

				{/* Duplicate Button */}
				{tile.type === 'widget' && (
					<MenuItem
						className='dark-menu-item'
						onClick={async () => {
							// shouldn't happen but just in case...
							if (tile.type !== 'widget') return;

							const { availableIndex, page } = nextAvailableIndex(tile.index);

							const newWidgetId = await copyWidget(tile.id);
							addTile({
								id: newWidgetId,
								index: availableIndex,
								folderId: tile.folderId,
							});

							copyWidgetAccounts(tile.id, newWidgetId);

							// in case next available index is on a different page
							setPage(page);

							setNewTileId(newWidgetId);
						}}
					>
						<DoubleSquareSvg className='size-4' />
						<p>Duplicate</p>
					</MenuItem>
				)}
			</Menu>
		</>
	);
}

type SlimeIconProps = {
	src?: string;
	type: 'folder' | 'widget';
};

function SlimeIcon({ src, type }: SlimeIconProps) {
	const [aspectRatio, setAspectRatio] = useState(1);
	const paddingTop = `${Math.min(aspectRatio * 16, 40)}%`;
	const paddingBottom = `${Math.min(aspectRatio * 5, 10)}%`;

	if (!src) return null;

	return (
		<div
			data-aspect={aspectRatio}
			className={clsx(
				'absolute inset-1 flex justify-center overflow-hidden p-1',
				type === 'widget' && 'rounded-slime',
			)}
			style={
				type === 'widget'
					? {
							paddingTop,
							paddingBottom,
						}
					: undefined
			}
		>
			<img
				src={src}
				onLoad={event => {
					const img = event.currentTarget;
					setAspectRatio(img.naturalWidth / img.naturalHeight);
				}}
				className='tile-image max-h-full max-w-full rounded-1 object-scale-down smooth-image'
			/>
		</div>
	);
}

function getOpenButtonId(id: string) {
	return `open-${id}`;
}
