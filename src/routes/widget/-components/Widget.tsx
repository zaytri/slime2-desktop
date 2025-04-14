import Header from '@/components/header/Header';
import HeaderText from '@/components/header/HeaderText';
import ArrowLeftSvg from '@/components/svg/ArrowLeftSvg';
import GearSvg from '@/components/svg/GearSvg';
import HeaderButton from '@/components/TileSettingsButton';
import { useDialog } from '@/contexts/dialog/useDialog';
import useTileLocation from '@/contexts/tile_locations/useTileLocation';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { useWidgetSettings } from '@/contexts/widget_settings/useWidgetSettings';
import { getTileIconUrl } from '@/helpers/media';
import { memo } from 'react';

type WidgetProps = {
	widgetId: string;
};

const Widget = memo(function Widget({ widgetId }: WidgetProps) {
	const { loading, error, settings } = useWidgetSettings();
	const { tileMeta } = useTileMeta(widgetId);
	const tileLocation = useTileLocation(widgetId);
	const { open } = useDialog();

	if (loading) {
		return <p>loading...</p>;
	}

	if (error) {
		return <p>error loading widget settings!</p>;
	}

	return (
		<div className='w-full'>
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
						src={getTileIconUrl(widgetId, tileMeta.icon)}
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

			<p>{JSON.stringify(settings)}</p>
		</div>
	);
});

export default Widget;
