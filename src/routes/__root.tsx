import logoSlime from '@/assets/logo_slime_stencil.svg';
import logoText from '@/assets/logo_text_stencil.svg';
import DialogProvider from '@/contexts/dialog/DialogProvider';

import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
const appWindow = getCurrentWebviewWindow();

export const Route = createRootRoute({ component: Root });

function Root() {
	return (
		<DialogProvider>
			<div className='relative flex flex-1 origin-bottom animate-intro overflow-hidden'>
				<div className='grid flex-1 grid-cols-8 grid-rows-1'>
					<div className='relative rounded-[5rem] rounded-r-none border-8 border-emerald-900 bg-lime-300'>
						<div className='mt-8 flex justify-center'>
							<Link to='/settings'>
								<button
									type='button'
									className='flex h-28 w-28 items-center justify-center self-end rounded-100% border-4 border-lime-600 bg-emerald-900 font-bold text-white'
								>
									Settings
								</button>
							</Link>
						</div>
						<div className='absolute bottom-4 left-0 right-0 px-4'>
							<img src={logoText} className='text-slate-700' />
						</div>
					</div>
					<div className='relative z-10 col-span-6 flex border-8 border-x-0 border-emerald-900 bg-lime-50'>
						<Outlet />
					</div>
					<div className='relative rounded-[5rem] rounded-l-none border-8 border-emerald-900 bg-lime-300'>
						<div className='ml-3 mt-10 flex w-24 flex-col'>
							<button
								className='flex h-10 w-10 items-center justify-center self-end rounded-100% border-4 border-lime-600 bg-emerald-900 font-bold text-white'
								onClick={() => {
									appWindow.close();
								}}
							>
								X
							</button>
							<button
								className='flex h-10 w-10 items-center justify-center rounded-100% border-4 border-lime-600 bg-emerald-900 font-black text-white'
								onClick={() => {
									appWindow.minimize();
								}}
							>
								_
							</button>
						</div>
						<div className='absolute bottom-4 left-0 right-0 pb-4 pl-3 pr-4'>
							<img src={logoSlime} className='text-slate-700' />
						</div>
					</div>
				</div>
			</div>
		</DialogProvider>
	);
}
