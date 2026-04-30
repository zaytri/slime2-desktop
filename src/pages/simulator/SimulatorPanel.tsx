import AccountServiceTag from '@/components/tag/AccountServiceTag';
import PaperAirplaneSvg from '@@/svg/PaperAirplaneSvg';
import SimulateTwitchChatMessage from './twitch/SimulateTwitchChatMessage';
import SimulateTwitchCheer from './twitch/SimulateTwitchCheer';
import SimulateTwitchFollow from './twitch/SimulateTwitchFollow';
import SimulateTwitchGiftSubscription from './twitch/SimulateTwitchGiftSubscription';
import SimulateTwitchRaid from './twitch/SimulateTwitchRaid';
import SimulateTwitchRedeem from './twitch/SimulateTwitchRedeem';
import SimulateTwitchSubscription from './twitch/SimulateTwitchSubscription';

export default function SimulatorPanel() {
	return (
		<div className='flex flex-1 p-4'>
			<div className='flex flex-1 flex-col gap-4 overflow-hidden dark-container p-6 pt-4'>
				<div className='flex items-center gap-4 text-white text-shadow-[0_2px_black]'>
					<h1 className='flex flex-1 items-center gap-4'>
						<PaperAirplaneSvg className='size-6 drop-shadow-[0_2px_black]' />
						<p className='-mb-0.5 flex-1 font-fredoka text-6 font-medium'>
							Event Simulator
						</p>
					</h1>

					<div className='inline-flex items-center gap-2 self-end text-4.5 font-bold'>
						Simulating{' '}
						<span className='text-shadow-none *:outline-2 *:outline-white'>
							<AccountServiceTag service='twitch' />
						</span>
					</div>
				</div>

				<section className='flex flex-1 flex-col justify-between overflow-hidden light-container'>
					<div className='flex flex-1 flex-col justify-between gap-4 overflow-y-auto p-4'>
						<div className='grid grid-cols-3 gap-4'>
							<SimulateTwitchChatMessage />
							<SimulateTwitchFollow />
							<SimulateTwitchRedeem />
							<SimulateTwitchCheer />
							<SimulateTwitchSubscription />
							<SimulateTwitchGiftSubscription />
							<SimulateTwitchRaid />
						</div>

						<em className='self-end text-3.5 text-zinc-600 text-shadow-[0_1px_white]'>
							Simulated events are sent to all related overlay and bot widgets
						</em>
					</div>
				</section>
			</div>
		</div>
	);
}
