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
	settings: (
		| WidgetSettingType.Category
		| WidgetSettingType.AnySection
	)['settings'];
};

export default function SettingsGroup({ settings }: SettingsGroupProps) {
	const values = useWidgetValues();
	const parentId = useWidgetSettingParent();

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
						<DevPeek id={id} setting={setting} />
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

type DevPeekProps = {
	id: string;
	setting: WidgetSettingType.NonCategory;
};

function DevPeek({ id, setting }: DevPeekProps) {
	const { settings: appSettings } = useSettings();

	if (
		!appSettings.devMode ||
		setting.type === 'section' ||
		setting.type === 'multi-section'
	)
		return;

	return (
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

			<Tooltip render={<section />} className='dark-menu min-w-0! p-0!'>
				<div className='flex flex-col gap-2 overflow-y-auto p-3 pt-2'>
					<h5 className='flex items-center gap-2 font-bold text-zinc-300 uppercase drop-shadow-[0_1px_black]'>
						<EyeSvg className='size-4' />
						Dev Peek
					</h5>

					<PeekTag label='ID' value={id} />
					{'defaultValue' in setting && (
						<PeekTag
							label='Default Value'
							value={setting.defaultValue ?? null}
						/>
					)}

					{'options' in setting && setting.options.length > 0 && (
						<div className='flex flex-col gap-2'>
							<p className='text-3.5 font-bold text-zinc-300 uppercase text-shadow-[0_1px_black]'>
								Options
							</p>
							<ul className='flex flex-col gap-1 pl-5'>
								{setting.options.map(option => {
									const label = i18nStringTransform(option.label);
									return (
										<li key={label} className='list-disc text-zinc-300'>
											<PeekTag label={label} value={option.value} />
										</li>
									);
								})}
							</ul>
						</div>
					)}
				</div>
			</Tooltip>
		</TooltipProvider>
	);
}

type PeekTagProps = {
	label: string;
	value: unknown;
};

function PeekTag({ label, value }: PeekTagProps) {
	return (
		<div className='grid grid-cols-2 items-center overflow-hidden rounded-1 border-2 border-zinc-400 bg-zinc-700 whitespace-nowrap text-white'>
			<p className='px-2 text-3.5 font-bold'>{label}</p>
			<div className='flex flex-col border-l border-zinc-400 bg-zinc-800 px-2 font-mono'>
				{Array.isArray(value) ? (
					value.map((item, index) => {
						return <p key={index}>{JSON.stringify(item)}</p>;
					})
				) : (
					<p>{JSON.stringify(value)}</p>
				)}
			</div>
		</div>
	);
}
