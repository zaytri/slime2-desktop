import { useSettings } from '@/contexts/settings/useSettings';
import useWidgetSettingParent from '@/contexts/widget_setting_parent/useWidgetSettingParent';
import { getWidgetValueChildKey } from '@/contexts/widget_setting_parent/useWidgetValueKey';
import useWidgetValues from '@/contexts/widget_values/useWidgetValues';
import { i18nStringTransform, i18nUndefined } from '@/helpers/i18n';
import type { WidgetSetting as WidgetSettingType } from '@@/json/widgetSettings';
import EyeSvg from '@@/svg/EyeSvg';
import { Tooltip, TooltipAnchor, TooltipProvider } from '@ariakit/react';
import WidgetSetting from './WidgetSetting';

type SettingsGroupProps = {
	settings:
		| WidgetSettingType.Category['settings']
		| WidgetSettingType.Section['settings']
		| WidgetSettingType.MultiSection['settings'];
};

export default function SettingsGroup({ settings }: SettingsGroupProps) {
	const values = useWidgetValues();
	const parentId = useWidgetSettingParent();
	const { settings: appSettings } = useSettings();

	return (
		<>
			{Object.entries(settings).map(([id, setting]) => {
				const conditionsMet =
					!setting.condition ||
					Object.entries(setting.condition).every(condition => {
						// settings within multisubsections can only be dependent
						// on other settings within that same multisubsection
						const [conditionId, conditionValue] = condition;
						const trueConditionId = parentId
							? getWidgetValueChildKey(parentId, conditionId)
							: conditionId;

						const dependentSetting = settings[conditionId];
						const dependentDefaultValue =
							dependentSetting && 'defaultValue' in dependentSetting
								? dependentSetting.defaultValue
								: undefined;

						const dependentValue =
							values[trueConditionId] ?? dependentDefaultValue;

						return Array.isArray(dependentValue)
							? dependentValue.includes(conditionValue)
							: dependentValue === conditionValue;
					});

				if (!conditionsMet) return null;

				const label = i18nStringTransform(setting.label);

				const placeholder =
					'placeholder' in setting
						? i18nUndefined(setting.placeholder)
						: undefined;
				const description =
					'description' in setting
						? i18nUndefined(setting.description)
						: undefined;

				const alt = 'alt' in setting ? i18nStringTransform(setting.alt) : '';

				return (
					<div className='flex'>
						{appSettings.devMode && (
							<TooltipProvider timeout={0} placement='right'>
								<TooltipAnchor
									className='z-10 -mb-100 -ml-4 self-start'
									render={<button type='button' />}
								>
									<div className='rounded-1 p-1 text-zinc-600 over:bg-zinc-700 over:text-white over:outline over:outline-zinc-800'>
										<span className='sr-only'>Dev Peek</span>
										<EyeSvg className='size-4' />
									</div>
								</TooltipAnchor>

								<Tooltip className='dark-menu p-0!'>
									<p className='dark-menu-item flex justify-center px-2 py-1 font-mono select-all not-only:border-b not-only:border-zinc-500'>
										{parentId ? getWidgetValueChildKey(parentId, id) : id}
									</p>
									{'options' in setting && (
										<div className='flex flex-col px-2 py-1'>
											{setting.options.map(option => {
												return (
													<div className='dark-menu-item flex gap-1 p-0!'>
														<p>{i18nStringTransform(option.label)}:</p>
														<p className='font-mono'>
															{JSON.stringify(option.value)}
														</p>
													</div>
												);
											})}
										</div>
									)}
								</Tooltip>
							</TooltipProvider>
						)}
						<div className='flex flex-1 flex-col'>
							<WidgetSetting
								key={id}
								id={id}
								{...setting}
								label={label}
								placeholder={placeholder}
								description={description}
								alt={alt}
							/>
						</div>
					</div>
				);
			})}
		</>
	);
}
