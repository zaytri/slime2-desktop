import slime2face from '@/assets/slime2face.png';
import ToggleField from '@/components/input_fields/ToggleField';
import GearSvg from '@/components/svg/GearSvg';
import { useSettings } from '@/contexts/settings/useSettings';
import useAppVersionQuery from '@/hooks/useAppVersionQuery';

export default function SettingsPanel() {
	const appVersionQuery = useAppVersionQuery();
	const { settings, setSettings } = useSettings();

	return (
		<div className='flex flex-1 p-4'>
			<div className='flex flex-1 flex-col gap-4 overflow-hidden dark-container p-6 pt-4'>
				<div className='flex items-center gap-4 text-white text-shadow-[0_2px_black]'>
					<h1 className='flex flex-1 items-center gap-4'>
						<GearSvg className='size-6 drop-shadow-[0_2px_black]' />
						<p className='-mb-0.5 flex-1 font-fredoka text-6 font-medium'>
							App Settings
						</p>
					</h1>

					{appVersionQuery.data && (
						<p className='self-end text-3.5 font-bold'>
							slime2 v{appVersionQuery.data}
						</p>
					)}

					<img src={slime2face} className='-my-1 w-10 self-end smooth-image' />
				</div>

				<div className='flex flex-1 flex-col gap-4 light-container p-4'>
					<ToggleField
						label='Developer Mode'
						value={settings.devMode}
						onChange={value => {
							setSettings({ ...settings, devMode: value });
						}}
						description='Enables extra features for widget developers'
					/>

					<ToggleField
						label='Disable UI Animations'
						value={settings.disableAnimations}
						onChange={value => {
							setSettings({ ...settings, disableAnimations: value });
						}}
						description='UI transitions will be instant rather than animated (does not affect overlay widget animations)'
					/>

					{/* <div className='flex flex-1 items-end justify-end'>
						<p className='text-3.5 text-zinc-500 italic'>
							Tip: You can right-click on the widget grid tiles to move them
						</p>
					</div> */}
				</div>
			</div>
		</div>
	);
}
