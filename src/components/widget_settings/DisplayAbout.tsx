import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import { getWidgetIconSrc } from '@/helpers/media';
import LinkifyText from '../LinkifyText';
import AccountServiceTag from '../tag/AccountServiceTag';
import WidgetTypeTag from '../tag/WidgetTypeTag';

type DisplayAboutProps = {
	widgetId: string;
};

export default function DisplayAbout({ widgetId }: DisplayAboutProps) {
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
		<div className='flex gap-4 rounded-2 border border-white bg-zinc-100 bg-linear-to-b from-zinc-50 to-zinc-100 p-3 pt-2 outline-2 outline-zinc-300'>
			<div className='flex flex-1 flex-col gap-2'>
				<div className='flex items-center gap-3'>
					<h3 className='flex-1 text-shadow-[0_1px_white]'>
						<span className='font-mochiy text-4.5 text-zinc-800'>
							{widgetMeta.name}
						</span>
						<span className='pl-2 font-fredoka text-4.5 font-medium text-zinc-500'>
							v{widgetMeta.version}
						</span>
					</h3>

					<div className='flex gap-1 font-semibold'>
						{usesService.twitch && <AccountServiceTag service='twitch' />}
						{usesService.youtube && <AccountServiceTag service='youtube' />}
						{widgetMeta.type.includes('bot') && <WidgetTypeTag type='bot' />}
						{widgetMeta.type.includes('overlay') && (
							<WidgetTypeTag type='overlay' />
						)}
					</div>
				</div>

				<div className='flex flex-1 gap-3 rounded-1.5 bg-white px-3 py-2 outline-2 outline-zinc-300'>
					{widgetMeta.icon && (
						<img
							src={getWidgetIconSrc(widgetId, widgetMeta.icon)}
							className='size-22 rounded-1 object-contain smooth-image'
						/>
					)}

					<LinkifyText
						className='flex flex-1 flex-col'
						linkClassName='text-green-700 font-semibold'
					>
						<AboutDetail label='Creator'>{widgetMeta.creator}</AboutDetail>
						{widgetMeta.website && (
							<AboutDetail label='Website'>{widgetMeta.website}</AboutDetail>
						)}
						{widgetMeta.support && (
							<AboutDetail label='Support'>{widgetMeta.support}</AboutDetail>
						)}
					</LinkifyText>
				</div>
			</div>
		</div>
	);
}

type AboutDetailProps = {
	label: string;
};

function AboutDetail({
	label,
	children,
}: Props.WithChildren<AboutDetailProps>) {
	return (
		<p className='text-4.5'>
			<strong className='pr-1.5 font-fredoka font-medium text-zinc-800'>
				{label}:
			</strong>
			<span className='font-semibold'>{children}</span>
		</p>
	);
}
