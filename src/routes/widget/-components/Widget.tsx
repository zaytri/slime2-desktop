import TileSettingsDialog from '@/components/dialog/TileSettingsDialog';
import Header from '@/components/header/Header';
import HeaderButton from '@/components/header/HeaderButton';
import HeaderText from '@/components/header/HeaderText';
import ArrowLeftSvg from '@/components/svg/ArrowLeftSvg';
import ChainLinkSvg from '@/components/svg/ChainLinkSvg';
import GearSvg from '@/components/svg/GearSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import useTileLocation from '@/contexts/tile_locations/useTileLocation';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { getTileIconSrc } from '@/helpers/media';
import { DEV_WIDGET_SERVER_PORT, PROD_PORT } from '@/helpers/serverBaseUrl';
import { useParams } from '@tanstack/react-router';
import { memo } from 'react';
import WidgetSettings from './WidgetSettings';

const Widget = memo(function Widget() {
	const { widgetId } = useParams({ from: '/widget/$widgetId' });

	const { tileMeta } = useTileMeta(widgetId);
	const tileLocation = useTileLocation(widgetId);
	const { openDialog } = useDialog();

	return (
		<div className='flex w-full flex-col'>
			<Header className='w-full items-center gap-3 p-3'>
				<HeaderButton
					icon={<ArrowLeftSvg className='size-7' />}
					linkTo='/folder/$folderId'
					linkParams={{ folderId: tileLocation.folderId }}
				>
					Back
				</HeaderButton>

				{tileMeta.icon && (
					<img
						src={getTileIconSrc(widgetId, tileMeta.icon)}
						className='rounded-2 smooth-image h-10 w-12 border-2 border-amber-900 object-cover'
					/>
				)}

				<HeaderText className='flex-1'>{tileMeta.name}</HeaderText>

				<HeaderButton
					icon={<ChainLinkSvg className='size-7' />}
					externalHref={`http://localhost:${import.meta.env.PROD ? `${PROD_PORT}/widget` : DEV_WIDGET_SERVER_PORT}/?widgetId=${widgetId}`}
				>
					Open Overlay
				</HeaderButton>

				<HeaderButton
					icon={<GearSvg className='size-7' />}
					onClick={() => {
						openDialog(<TileSettingsDialog id={widgetId} />);
					}}
				>
					Tile Settings
				</HeaderButton>
			</Header>

			<WidgetSettings />
		</div>
	);
});

export default Widget;
