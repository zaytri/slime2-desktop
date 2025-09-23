import Header from '@/components/header/Header';
import HeaderButton from '@/components/header/HeaderButton';
import HeaderText from '@/components/header/HeaderText';
import ArrowLeftSvg from '@/components/svg/ArrowLeftSvg';
import ChainLinkSvg from '@/components/svg/ChainLinkSvg';
import ChatBubbleSvg from '@/components/svg/ChatBubbleSvg';
import useTileLocation from '@/contexts/tile_locations/useTileLocation';
import useTileLocations from '@/contexts/tile_locations/useTileLocations';
import { useTileMeta } from '@/contexts/tile_metas/useTileMeta';
import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import { getTileIconSrc } from '@/helpers/media';
import { DEV_WIDGET_SERVER_PORT, PROD_PORT } from '@/helpers/serverBaseUrl';
import { mockTwitchChatMessage } from '@/helpers/services/twitch/twitchMock';
import { useParams } from '@tanstack/react-router';
import { memo } from 'react';
import WidgetSettings from './WidgetSettings';

const Widget = memo(function Widget() {
	const { widgetId } = useParams({ from: '/widget/$widgetId' });
	const { tileMeta } = useTileMeta(widgetId);
	const { widgetMeta } = useWidgetMeta(widgetId);
	const tileLocation = useTileLocation(widgetId);
	const tileLocations = useTileLocations();

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
						className='rounded-2 smooth-image size-10 object-contain'
					/>
				)}

				<HeaderText className='flex-1'>{tileMeta.name}</HeaderText>

				<HeaderButton
					icon={<ChatBubbleSvg className='size-7' />}
					removeAnimation
					onClick={() => {
						Object.values(tileLocations).forEach(location => {
							if (location.id.startsWith('widget_')) {
								mockTwitchChatMessage(location.id);
							}
						});
					}}
				>
					Simulate Message
				</HeaderButton>

				{widgetMeta.import && (
					<HeaderButton
						icon={<ChainLinkSvg className='size-7' />}
						removeAnimation
						externalHref={`http://localhost:${import.meta.env.PROD ? `${PROD_PORT}/widget` : DEV_WIDGET_SERVER_PORT}/?widgetId=${widgetId}`}
					>
						Open Overlay
					</HeaderButton>
				)}
			</Header>

			<WidgetSettings />
		</div>
	);
});

export default Widget;
