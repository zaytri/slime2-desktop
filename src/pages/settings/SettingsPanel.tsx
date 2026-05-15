import HeaderButton from '@/components/header/HeaderButton';
import ToggleField from '@/components/input_fields/ToggleField';
import GearSvg from '@/components/svg/GearSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useSettings } from '@/contexts/settings/useSettings';
import useAppVersionQuery from '@/hooks/useAppVersionQuery';
import AboutDialog from '@@/dialog/AboutDialog';
import BookSvg from '@@/svg/BookSvg';

export default function SettingsPanel() {
	const appVersionQuery = useAppVersionQuery();
	const { settings, setSettings } = useSettings();
	const { openDialog } = useDialog();

	return (
		<div className='flex flex-1 p-4'>
			<div className='flex flex-1 flex-col gap-4 overflow-hidden dark-container p-6 pt-4'>
				<div className='flex items-center gap-4 text-white text-shadow-[0_2px_black]'>
					<h1 className='flex flex-1 items-center gap-4'>
						<GearSvg className='-mb-0.5 size-6 drop-shadow-[0_2px_black]' />
						<p className='flex-1 font-mochiy text-5'>App Settings</p>
					</h1>

					{appVersionQuery.data && (
						<p className='self-end font-bold'>Slime2 v{appVersionQuery.data}</p>
					)}

					<HeaderButton
						label='About'
						icon={BookSvg}
						className='border-yellow-300 bg-yellow-300 from-yellow-300 to-amber-400 text-amber-900 over:outline-yellow-600'
						onClick={() => {
							openDialog('About', <AboutDialog />);
						}}
					/>
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
				</div>
			</div>
		</div>
	);
}
