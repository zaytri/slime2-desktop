import { Account } from '@/helpers/json/accounts';
import YoutubeSvg from '@@/svg/YoutubeSvg';
import TwitchSvg from '../svg/TwitchSvg';
import Tag from './Tag';

type AccountServiceTagProps = {
	service: Account['service'];
	mini?: boolean;
};

export default function AccountServiceTag({
	service,
	mini,
}: AccountServiceTagProps) {
	switch (service) {
		case 'twitch':
			return (
				<Tag
					label='Twitch'
					icon={<TwitchSvg className='h-4' />}
					className='border-violet-700 bg-[#9146FF]'
					mini={mini}
				/>
			);
		case 'youtube':
			return (
				<Tag
					label='YouTube'
					icon={<YoutubeSvg className='h-4' />}
					className='border-rose-950 bg-rose-800'
					mini={mini}
				/>
			);
		default:
			return null;
	}
}
