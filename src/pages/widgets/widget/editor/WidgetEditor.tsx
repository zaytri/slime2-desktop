import HeaderBackButton from '@/components/header/HeaderBackButton';
import HeaderButton from '@/components/header/HeaderButton';
import { useDialog } from '@/contexts/dialog/useDialog';
import { useWidgetId } from '@/contexts/widget_id/useWidgetId';
import { useWidgetMeta } from '@/contexts/widget_metas/useWidgetMeta';
import {
	widgetSettingsEditorReducer,
	type WidgetSettingsEditorAction,
} from '@/contexts/widget_settings_editor/useWidgetSettingsEditorDispatch';
import WidgetSettingsEditorProvider from '@/contexts/widget_settings_editor/WidgetSettingsEditorProvider';
import { saveTempWidgetCoreIcon } from '@/helpers/commands';
import GenericDeleteDialog from '@@/dialog/GenericDeleteDialog';
import type { WidgetMeta } from '@@/json/widgetMeta';
import {
	updateWidgetSettings,
	type WidgetSettings,
} from '@@/json/widgetSettings';
import ArrowDownTraySvg from '@@/svg/ArrowDownTraySvg';
import { useReducer, useState } from 'react';
import WidgetIconEditor from './WidgetIconEditor';
import WidgetMetaEditor from './WidgetMetaEditor';
import WidgetSettingsEditor from './WidgetSettingsEditor';

type WidgetEditorProps = {
	settings: WidgetSettings;
	onBack: VoidFunction;
};

export default function WidgetEditor({ settings, onBack }: WidgetEditorProps) {
	const widgetId = useWidgetId();
	const { widgetMeta, setWidgetMeta } = useWidgetMeta(widgetId);
	const { openDialog } = useDialog();
	const [newSettings, dispatchNewSettings] = useReducer(
		widgetSettingsEditorReducer,
		settings,
	);
	const [newWidgetMeta, setNewWidgetMeta] = useState<WidgetMeta>(widgetMeta!);
	const [newIcon, setNewIcon] = useState<string | null>(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [saving, setSaving] = useState(false);

	function onChangeSettings(action: WidgetSettingsEditorAction) {
		setHasChanges(true);
		dispatchNewSettings(action);
	}

	function onChangeMeta(value: WidgetMeta) {
		setHasChanges(true);
		setNewWidgetMeta(value);
	}

	function onChangeIcon(value: string) {
		setHasChanges(true);
		setNewIcon(value);
	}

	async function onSave() {
		if (!hasChanges) {
			onBack();
		} else {
			setSaving(true);
			setWidgetMeta({
				name: newWidgetMeta.name.trim() || widgetMeta!.name,
				creator: newWidgetMeta.creator.trim() || widgetMeta!.creator,
				version: newWidgetMeta.version.trim() || widgetMeta!.version,
				website: newWidgetMeta.website?.trim(),
				support: newWidgetMeta.support?.trim(),
				type: newWidgetMeta.type,
				accounts: newWidgetMeta.accounts,
				import: newWidgetMeta.import
					? {
							js: newWidgetMeta.import.js
								? newWidgetMeta.import.js
										.map(js => {
											return js.trim();
										})
										.filter(js => {
											return js !== '';
										})
								: undefined,
							css: newWidgetMeta.import.css
								? newWidgetMeta.import.css
										.map(css => {
											return css.trim();
										})
										.filter(css => {
											return css !== '';
										})
								: undefined,
						}
					: undefined,
				channels: newWidgetMeta.channels
					? newWidgetMeta.channels
							.map(channel => {
								return channel.trim();
							})
							.filter(channel => {
								return channel !== '';
							})
					: undefined,
			});

			const promises: Promise<any>[] = [
				updateWidgetSettings(widgetId, newSettings),
			];

			if (newIcon) {
				promises.push(saveTempWidgetCoreIcon(newIcon, widgetId));
			}

			await Promise.all(promises);

			setSaving(false);
			onBack();
		}
	}

	return (
		<div className='flex flex-1 p-4'>
			<div className='flex flex-1 flex-col gap-4 overflow-hidden dark-container p-6 pt-4'>
				<div className='flex items-center gap-4'>
					<div className='-ml-2 flex flex-1 items-center gap-4 text-white text-shadow-[0_2px_black]'>
						<HeaderBackButton
							onClick={() => {
								if (hasChanges) {
									openDialog(
										'Unsaved Changes',
										<GenericDeleteDialog
											onDelete={() => {
												onBack();
											}}
											actionText='Discard Changes and Exit'
										>
											<p>
												You have some <strong>unsaved changes</strong>!
											</p>
											<p>
												Exiting the Widget Editor now will{' '}
												<strong>discard</strong> these changes. Are you sure you
												want to leave?
											</p>
										</GenericDeleteDialog>,
									);
								} else {
									onBack();
								}
							}}
						/>

						<h1 className='flex items-center gap-4'>
							<p className='flex-1 font-mochiy text-5'>Widget Core Editor</p>
						</h1>
					</div>

					<div className='flex flex-2 items-center justify-between text-white text-shadow-[0_2px_black]'>
						<WidgetIconEditor value={newIcon} onChange={onChangeIcon} />

						<HeaderButton
							icon={ArrowDownTraySvg}
							label={saving ? 'Saving...' : 'Save and Exit'}
							disabled={saving}
							className='border-lime-400 bg-lime-300 from-lime-400 to-green-400 text-green-900 over:outline-green-600'
							onClick={() => {
								onSave();
							}}
						/>
					</div>
				</div>

				<div className='-m-1 flex flex-1 gap-4 overflow-hidden border-t border-zinc-600 p-1 pt-2'>
					<WidgetMetaEditor value={newWidgetMeta} onChange={onChangeMeta} />

					<WidgetSettingsEditorProvider
						state={newSettings}
						dispatch={onChangeSettings}
					>
						<WidgetSettingsEditor />
					</WidgetSettingsEditorProvider>
				</div>
			</div>
		</div>
	);
}
