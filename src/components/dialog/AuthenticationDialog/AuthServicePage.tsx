import { usePage } from '@/contexts/pages/usePage';
import { usePageContext } from '@/contexts/pages/usePageContext';
import TwitchSvg from '@@/svg/TwitchSvg';
import { AuthenticationContext, AuthenticationPages } from '.';

export default function AuthServicePage() {
	const { setPage } = usePage<AuthenticationPages>();
	const { setService } = usePageContext<AuthenticationContext>();

	return (
		<div className='gap-4t flex flex-1 flex-col items-center'>
			<button
				className='group/button relative flex items-center gap-2 overflow-hidden rounded-2 bg-[#9146FF] px-4 py-2 text-5 font-bold text-white outline-2 -outline-offset-1! outline-violet-700 over:outline-4 over:outline-violet-800'
				onClick={() => {
					setService('twitch');
					setPage('twitch');
				}}
			>
				<div className='absolute inset-0 bottom-1/2 bg-linear-to-b from-white/30 to-white/20 group-over/button:hidden'></div>
				<TwitchSvg className='size-5 drop-shadow-[0_1px_#0006]' />
				<p className='text-shadow-[0_1px_#0006]'>Connect with Twitch</p>
			</button>
		</div>
	);
}
