import HeaderButton from '@/components/header/HeaderButton';
import ToggleField from '@/components/input_fields/ToggleField';
import GearSvg from '@/components/svg/GearSvg';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useSettings } from '@/contexts/settings/useSettings';
import useUpdate from '@/contexts/update/useUpdate';
import { revealLogFile } from '@/helpers/commands';
import useAppVersionQuery from '@/hooks/useAppVersionQuery';
import AboutDialog from '@@/dialog/AboutDialog';
import UpdateDialog from '@@/dialog/UpdateDialog';
import ArrowDownTraySvg from '@@/svg/ArrowDownTraySvg';
import BookSvg from '@@/svg/BookSvg';
import EyeSvg from '@@/svg/EyeSvg';

export default function SettingsPanel() {
	const appVersionQuery = useAppVersionQuery();
	const { settings, setSettings } = useSettings();
	const { openDialog } = useDialog();
	const update = useUpdate();

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

					{update && (
						<HeaderButton
							label='Update Available!'
							icon={ArrowDownTraySvg}
							className='border-purple-300 bg-purple-300 from-purple-300 to-violet-400 text-violet-900 outline-2 outline-offset-2 outline-white over:outline-white'
							onClick={() => {
								openDialog(
									'Update Available!',
									<UpdateDialog update={update} />,
								);
							}}
						/>
					)}

					<HeaderButton
						label='About'
						icon={BookSvg}
						className='border-lime-400 bg-lime-300 from-lime-400 to-green-400 text-green-900 over:outline-green-600'
						onClick={() => {
							openDialog('About', <AboutDialog />);
						}}
					/>

					<HeaderButton
						label='Show Logs'
						icon={EyeSvg}
						className='border-yellow-300 bg-yellow-300 from-yellow-300 to-amber-400 text-amber-900 over:outline-yellow-600'
						onClick={() => {
							revealLogFile();
						}}
					/>
				</div>

				<div className='flex flex-1 flex-col gap-4 light-container p-4'>
					<ToggleField
						label='Disable UI Animations'
						value={settings.disableAnimations}
						onChange={value => {
							setSettings({ ...settings, disableAnimations: value });
						}}
						description='UI transitions will be instant rather than animated (does not affect overlay widget animations)'
					/>

					<ToggleField
						label='Developer Mode'
						value={settings.devMode}
						onChange={value => {
							setSettings({ ...settings, devMode: value });
						}}
						description='Enables extra features for widget developers'
					/>

					{settings.devMode && (
						<ToggleField
							label='Log All Widget Events'
							value={settings.logWidgetEvents}
							onChange={value => {
								setSettings({ ...settings, logWidgetEvents: value });
							}}
							description='Automatically logs every event sent to widgets. Sent to console for overlays, sent to bot logs for bots.'
						/>
					)}
				</div>
			</div>
		</div>
	);
}
