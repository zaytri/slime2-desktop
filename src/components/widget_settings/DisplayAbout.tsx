import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import { getWidgetIconSrc } from '@/helpers/media';
import { memo } from 'react';
import LinkifyText from '../LinkifyText';
import AccountServiceTag from '../tag/AccountServiceTag';
import WidgetTypeTag from '../tag/WidgetTypeTag';

type DisplayAboutProps = {
	widgetId: string;
};

const DisplayAbout = memo(function DisplayAbout({
	widgetId,
}: DisplayAboutProps) {
	const { widgetMeta } = useWidgetMeta(widgetId);

	const usesService = {
		twitch: false,
		youtube: false,
	};

	widgetMeta.accounts.forEach(account => {
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
		<div className='flex gap-4 rounded-2 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 p-3 outline-2 outline-zinc-300'>
			{widgetMeta.icon && (
				<img
					src={getWidgetIconSrc(widgetId, widgetMeta.icon)}
					className='size-36 self-center rounded-2 object-contain smooth-image'
				/>
			)}

			<div className='flex flex-1 flex-col gap-1'>
				<h3 className='-mt-0.5 font-fredoka text-5.5 font-medium text-shadow-[0_1px_white]'>
					{widgetMeta.name}{' '}
					<span className='font-nunito text-4.5 font-medium text-zinc-500'>
						v{widgetMeta.version}
					</span>
				</h3>

				<div className='flex flex-1 flex-col gap-1 rounded-1.5 bg-white px-4 py-2 outline-2 outline-zinc-300'>
					<LinkifyText
						className='flex flex-1 flex-col'
						linkClassName='text-green-700 font-semibold'
					>
						<p>
							<strong className='pr-0.5'>Creator:</strong> {widgetMeta.creator}
						</p>
						{widgetMeta.website && (
							<p>
								<strong className='pr-0.5'>Website:</strong>{' '}
								{widgetMeta.website}
							</p>
						)}
						{widgetMeta.support && (
							<p>
								<strong className='pr-0.5'>Support:</strong>{' '}
								{widgetMeta.support}
							</p>
						)}
					</LinkifyText>

					<div className='flex gap-1 font-semibold'>
						{usesService.twitch && <AccountServiceTag service='twitch' />}
						{usesService.youtube && <AccountServiceTag service='youtube' />}
						{widgetMeta.type.includes('bot') && <WidgetTypeTag type='bot' />}
						{widgetMeta.type.includes('overlay') && (
							<WidgetTypeTag type='overlay' />
						)}
					</div>
				</div>
			</div>
		</div>
	);
});

export default DisplayAbout;
