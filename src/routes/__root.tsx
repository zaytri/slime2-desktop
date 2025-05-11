import logoSlime from '@/assets/logo_slime_stencil.svg';
import logoText from '@/assets/logo_text_stencil.svg';
import DialogProvider from '@/contexts/dialog/DialogProvider';
import { loadWidgetSettings } from '@/helpers/json/widgetSettings';
import { loadWidgetValues } from '@/helpers/json/widgetValues';
import { sendWidgetValues } from '@/helpers/websocket';

import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useEffect } from 'react';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
const appWindow = getCurrentWebviewWindow();

export const Route = createRootRoute({ component: Root });

function Root() {
	useEffect(() => {
		let unlisten: UnlistenFn | undefined = undefined;

		async function register() {
			// sends widget values upon webhook registration
			unlisten = await listen<WidgetRegistration>(
				'widget-registration',
				async event => {
					try {
						// just in case payload isn't formatted correctly
						const { id } = WidgetRegistration.parse(event.payload);

						const [settings, values] = await Promise.all([
							loadWidgetSettings(id),
							loadWidgetValues(id),
						]);

						await sendWidgetValues(id, settings, values);
					} catch (error) {
						const validationError = fromError(error);
						console.error(validationError.toString());
					}
				},
			);
		}

		register();

		return () => {
			if (unlisten) unlisten();
		};
	}, []);

	return (
		<DialogProvider>
			<div className='animate-intro relative flex flex-1 origin-bottom overflow-hidden'>
				<div className='grid flex-1 grid-cols-8 grid-rows-1'>
					<div className='relative rounded-[5rem] rounded-r-none border-8 border-emerald-900 bg-lime-300'>
						<div className='mt-8 flex justify-center'>
							<Link to='/settings'>
								<button
									type='button'
									className='rounded-100% flex h-28 w-28 items-center justify-center self-end border-4 border-lime-600 bg-emerald-900 font-bold text-white'
								>
									Settings
								</button>
							</Link>
						</div>
						<div className='absolute right-0 bottom-4 left-0 px-4'>
							<img src={logoText} className='text-slate-700' />
						</div>
					</div>
					<div className='relative z-10 col-span-6 flex border-8 border-x-0 border-emerald-900 bg-lime-50'>
						<Outlet />
					</div>
					<div className='relative rounded-[5rem] rounded-l-none border-8 border-emerald-900 bg-lime-300'>
						<div className='mt-10 ml-3 flex w-24 flex-col'>
							<button
								className='rounded-100% flex h-10 w-10 items-center justify-center self-end border-4 border-lime-600 bg-emerald-900 font-bold text-white'
								onClick={() => {
									appWindow.close();
								}}
							>
								X
							</button>
							<button
								className='rounded-100% flex h-10 w-10 items-center justify-center border-4 border-lime-600 bg-emerald-900 font-black text-white'
								onClick={() => {
									appWindow.minimize();
								}}
							>
								_
							</button>
						</div>
						<div className='absolute right-0 bottom-4 left-0 pr-4 pb-4 pl-3'>
							<img src={logoSlime} className='text-slate-700' />
						</div>
					</div>
				</div>
			</div>
		</DialogProvider>
	);
}

const WidgetRegistration = z.object({ id: z.string() });
type WidgetRegistration = z.infer<typeof WidgetRegistration>;
