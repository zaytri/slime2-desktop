import ErrorDialog from '@/components/dialog/ErrorDialog';
import TileSettingsDialog from '@/components/dialog/TileSettingsDialog';
import DoubleSquareSvg from '@/components/svg/DoubleSquareSvg';
import PencilSvg from '@/components/svg/PencilSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import useTileFolder, {
	TILES_PER_PAGE,
	TileSlot,
} from '@/contexts/tile_locations/useTileFolder';
import { useTileLocationsDispatch } from '@/contexts/tile_locations/useTileLocationsDispatch';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { copyWidget } from '@/helpers/commands';
import { TileColor } from '@/helpers/tileColors';
import { Menu, MenuItem, useMenuStore } from '@ariakit/react';
import { useNavigate } from '@tanstack/react-router';
import { memo, useState } from 'react';
import TileAction from './TileAction';
import TileAnimationWrapper from './TileAnimationWrapper';
import TileBackground from './TileBackground';
import TileImage from './TileImage';
import TileTooltip from './TileTooltip';

type Props = TileSlot & {
	folderColor?: TileColor;
};

const Tile = memo(function Tile({
	index,
	id,
	type,
	folderId,
	folderColor = TileColor.Green,
}: Props) {
	const { getPage } = useTileFolder(folderId);
	const { tileMeta } = useTileMeta(id);
	const firstRow = index % TILES_PER_PAGE < 5;
	const [menuAnchorRect, setMenuAnchorRect] = useState({ x: 0, y: 0 });
	const menuStore = useMenuStore();
	const navigate = useNavigate();
	const { openDialog } = useDialog();
	const { addTile } = useTileLocationsDispatch();

	return (
		<>
			<button
				type='button'
				className='group flex items-center justify-center'
				onContextMenu={event => {
					event.preventDefault();
					event.stopPropagation();
					setMenuAnchorRect({ x: event.clientX, y: event.clientY });
					menuStore.show();
				}}
				onClick={async () => {
					if (type === 'folder') {
						await navigate({
							to: '/folder/$folderId',
							params: { folderId: id },
						});
					} else if (type === 'widget') {
						await navigate({
							to: '/widget/$widgetId',
							params: { widgetId: id },
						});
					}
				}}
			>
				<TileAnimationWrapper>
					<TileBackground
						type={type}
						color={type === 'folder' ? tileMeta.color : folderColor}
					>
						{/* tile image */}
						<TileImage id={id} type={type} />

						{/* action */}
						<TileAction action='Open' />
					</TileBackground>

					{/* title tooltip */}
					<TileTooltip position={firstRow ? 'below' : 'above'}>
						{tileMeta.name}
					</TileTooltip>
				</TileAnimationWrapper>
			</button>
			<Menu
				className='rounded-2 text-3.5 flex w-32 flex-col border border-stone-300 bg-white p-2 shadow data-focus:outline-2'
				store={menuStore}
				modal
				getAnchorRect={() => menuAnchorRect}
			>
				<MenuItem
					className='mini-menu-item'
					onClick={() => {
						openDialog(<TileSettingsDialog id={id} />);
					}}
				>
					<PencilSvg className='size-3.5' />
					<p>Edit Tile</p>
				</MenuItem>
				{type === 'widget' && (
					<MenuItem
						className='mini-menu-item'
						onClick={async () => {
							const page = getPage(0);
							const newIndex = page.findIndex(tile => tile.type === 'empty');
							if (newIndex === -1) {
								openDialog(
									<ErrorDialog
										title='Max Capacity'
										description='No empty slots to duplicate into!'
									/>,
								);
								return;
							}

							const newWidgetId = await copyWidget(id);
							addTile({
								id: newWidgetId,
								index: newIndex,
								folderId,
							});
						}}
					>
						<DoubleSquareSvg className='size-3.5' />
						<p>Duplicate</p>
					</MenuItem>
				)}
			</Menu>
		</>
	);
});

export default Tile;
