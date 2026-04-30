import GearSvg from '@/components/svg/GearSvg';
import PointerSvg from '@/components/svg/PointerSvg';
import TVSvg from '@/components/svg/TVSvg';
import DialogProvider from '@/contexts/dialog/DialogProvider';
import useTwitchBot from '@/hooks/useTwitchBot';
import useTwitchWebsocket from '@/hooks/useTwitchWebsocket';
import useWidgetCoreChange from '@/hooks/useWidgetCoreChange';
import useWidgetRegistration from '@/hooks/useWidgetRegistration';
import useWidgetRequest from '@/hooks/useWidgetRequest';

import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({ component: Root });

function Root() {
	useWidgetRegistration();
	useWidgetRequest();
	useWidgetCoreChange();
	useTwitchWebsocket();
	useTwitchBot();

	return (
		<DialogProvider>
			<div className='h-full w-full flex flex-1 bg-linear-to-b from-gray-800 to-gray-950'>
				<div className='flex flex-col p-6 pr-0 gap-6 items-stretch justify-between w-40 relative z-10'>
					<div className='absolute inset-0 flex flex-col items-center'>
						<div className='ml-6 w-20 h-full bg-gray-200/20 border-x-4 border-gray-100/10'></div>
					</div>
					<button className='font-jua rounded-4 pt-3 pb-1 bg-linear-to-b over:from-lime-300 over:to-green-500 from-lime-400 to-green-600 text-white flex items-center gap-2 relative overflow-hidden border-green-800 border-2 over:inset-shadow-[0_0_10px_10px_#FFF4] group flex-col'>
						<div className='border group-over:opacity-50 group-hover:border-2 border-white rounded-4 absolute inset-0 opacity-30'></div>
						<TVSvg className='size-16 text-white drop-shadow-[0_3px_#0006]' />
						<p className='text-shadow-[0_3px_#0006] z-10 text-6'>Accounts</p>
					</button>
					<div className='flex-1'></div>
					<button className='font-jua rounded-4 pt-3 pb-1 bg-linear-to-b over:from-yellow-400 over:to-amber-600 from-yellow-500 to-amber-700 text-white flex items-center gap-2 relative overflow-hidden border-amber-800 border-2 over:inset-shadow-[0_0_10px_10px_#FFF4] group flex-col'>
						<div className='border group-over:opacity-50 group-hover:border-2 border-white rounded-4 absolute inset-0 opacity-30'></div>
						<PointerSvg className='size-14 text-white drop-shadow-[0_4px_#0006]' />
						<p className='text-shadow-[0_3px_#0006] z-10 text-6'>Simulate</p>
					</button>
					<button className='font-jua rounded-4 pt-3 pb-1 bg-linear-to-b over:from-sky-300 over:to-indigo-500 from-sky-400 to-indigo-600 text-white flex items-center gap-2 relative overflow-hidden border-indigo-800 border-2 over:inset-shadow-[0_0_10px_10px_#FFF4] group flex-col'>
						<div className='border group-over:opacity-50 group-hover:border-2 border-white rounded-4 absolute inset-0 opacity-30'></div>
						<GearSvg className='size-16 text-white drop-shadow-[0_4px_#0006]' />
						<p className='text-shadow-[0_3px_#0006] z-10 text-6'>Settings</p>
					</button>

					<div className='rounded-r-[50px_1000px] bg-linear-to-b from-gray-800 to-gray-950 w-8 h-full absolute left-full inset-y-0 -z-10'></div>
				</div>
				<div className='flex flex-1 relative overflow-hidden'>
					<div className='overflow-hidden flex flex-1'>
						<Outlet />
					</div>
				</div>
			</div>
		</DialogProvider>
	);
}

{
	/* <Link to='/settings'>
								<button
									type='button'
									className='rounded-100% flex h-28 w-28 items-center justify-center self-end border-4 border-lime-600 bg-emerald-900 font-bold text-white'
								>
									Settings
								</button>
							</Link> */
}
