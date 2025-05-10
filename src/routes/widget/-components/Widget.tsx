import Header from '@/components/header/Header';
import HeaderText from '@/components/header/HeaderText';
import ArrowLeftSvg from '@/components/svg/ArrowLeftSvg';
import GearSvg from '@/components/svg/GearSvg';
import HeaderButton from '@/components/TileSettingsButton';
import { useDialog } from '@/contexts/dialog/useDialog';
import useTileLocation from '@/contexts/tile_locations/useTileLocation';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import WidgetValuesProvider from '@/contexts/widget_values/WidgetValuesProvider';
import { getTileIconSrc } from '@/helpers/media';
import { useParams } from '@tanstack/react-router';
import { memo } from 'react';
import WidgetSettings from './WidgetSettings';

const Widget = memo(function Widget() {
	const { widgetId } = useParams({ from: '/widget/$widgetId' });

	const { tileMeta } = useTileMeta(widgetId);
	const tileLocation = useTileLocation(widgetId);
	const { open } = useDialog();

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
					icon={<GearSvg className='size-7' />}
					onClick={() => {
						open({
							name: 'TileSettings',
							payload: { id: widgetId },
						});
					}}
				>
					Tile Settings
				</HeaderButton>
			</Header>

			<WidgetValuesProvider id={widgetId}>
				<WidgetSettings />
			</WidgetValuesProvider>
		</div>
	);
});

export default Widget;
