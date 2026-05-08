import useWidgetSettingParent from '@/contexts/widget_setting_parent/useWidgetSettingParent';
import { getWidgetValueChildKey } from '@/contexts/widget_setting_parent/useWidgetValueKey';
import useWidgetValues from '@/contexts/widget_values/useWidgetValues';
import { i18nStringTransform, i18nUndefined } from '@/helpers/i18n';
import type { WidgetSetting as WidgetSettingType } from '@@/json/widgetSettings';
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

	return (
		<>
			{Object.entries(settings).map(([id, setting]) => {
				const conditionsMet =
					!setting.condition ||
					Object.entries(setting.condition).every(dependency => {
						// settings within multisubsections can only be dependent
						// on other settings within that same multisubsection
						const [dependentId, dependentValue] = dependency;
						const trueDependentId = parentId
							? getWidgetValueChildKey(parentId, dependentId)
							: dependentId;

						const dependentSetting = settings[dependentId];
						const dependentDefaultValue =
							dependentSetting && 'defaultValue' in dependentSetting
								? dependentSetting.defaultValue
								: undefined;

						return (
							dependentValue ===
							(values[trueDependentId] ?? dependentDefaultValue)
						);
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
					<WidgetSetting
						key={id}
						id={id}
						{...setting}
						label={label}
						placeholder={placeholder}
						description={description}
						alt={alt}
					/>
				);
			})}
		</>
	);
}
