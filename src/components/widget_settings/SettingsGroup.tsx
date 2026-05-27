import useWidgetSettingParent from '@/contexts/widget_setting_parent/useWidgetSettingParent';
import { getWidgetValueChildKey } from '@/contexts/widget_setting_parent/useWidgetValueKey';
import useWidgetValues from '@/contexts/widget_values/useWidgetValues';
import { i18nStringTransform, i18nUndefined } from '@/helpers/i18n';
import type { WidgetSetting as WidgetSettingType } from '@@/json/widgetSettings';
import clsx from 'clsx';
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
				const conditions = Object.entries(setting.condition ?? {});
				const conditionsMet =
					conditions.length === 0 ||
					conditions.some(condition => {
						// settings within multisubsections can only be dependent
						// on other settings within that same multisubsection
						const [conditionId, conditionValues] = condition;

						const conditionArray = Array.isArray(conditionValues)
							? conditionValues
							: [conditionValues];
						return conditionArray.some(conditionValue => {
							const trueConditionId = parentId
								? getWidgetValueChildKey(parentId, conditionId)
								: conditionId;

							const dependentSetting = settings[conditionId];
							let dependentDefaultValue =
								dependentSetting && 'defaultValue' in dependentSetting
									? dependentSetting.defaultValue
									: undefined;

							if (
								dependentSetting &&
								'options' in dependentSetting &&
								!dependentDefaultValue
							) {
								if (dependentSetting.type === 'multi-select-input') {
									dependentDefaultValue = [];
								} else {
									dependentDefaultValue = dependentSetting.options[0]?.value;
								}
							}

							const dependentValue =
								values[trueConditionId] ?? dependentDefaultValue;

							return Array.isArray(dependentValue)
								? dependentValue.includes(conditionValue)
								: dependentValue === conditionValue;
						});
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
					<div
						key={id}
						className={clsx(
							'halfSpan' in setting && setting.halfSpan
								? 'col-span-1'
								: 'col-span-full',
						)}
					>
						<WidgetSetting
							id={id}
							{...setting}
							label={label}
							placeholder={placeholder}
							description={description}
							alt={alt}
						/>
					</div>
				);
			})}
		</>
	);
}
