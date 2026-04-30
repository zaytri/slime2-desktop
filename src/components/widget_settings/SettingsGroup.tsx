import useWidgetSettingParent from '@/contexts/widget_setting_parent/useWidgetSettingParent';
import { getWidgetValueChildKey } from '@/contexts/widget_setting_parent/useWidgetValueKey';
import useWidgetValues from '@/contexts/widget_values/useWidgetValues';
import { useWidgetValuesDispatch } from '@/contexts/widget_values/useWidgetValuesDispatch';
import { i18nStringTransform, i18nUndefined } from '@/helpers/i18n';
import type { WidgetSetting as WidgetSettingType } from '@@/json/widgetSettings';
import { memo } from 'react';
import WidgetSetting from './WidgetSetting';

type SettingsGroupProps = {
	settings:
		| WidgetSettingType.Category['settings']
		| WidgetSettingType.Section['settings']
		| WidgetSettingType.MultiSection['settings'];
};

const SettingsGroup = memo(function SettingsGroup({
	settings,
}: SettingsGroupProps) {
	const values = useWidgetValues();
	const parentId = useWidgetSettingParent();
	const { set } = useWidgetValuesDispatch();

	return (
		<>
			{Object.entries(settings).map(([id, setting]) => {
				const conditionsMet =
					!setting.condition ||
					Object.entries(setting.condition).every(dependency => {
						const [dependentId, dependentValue] = dependency;
						const trueDependentId = parentId
							? getWidgetValueChildKey(parentId, dependentId)
							: dependentId;

						return values[trueDependentId] === dependentValue;
					});

				if (!conditionsMet) return null;

				const widgetValue = values[id];

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
						widgetValue={widgetValue}
						setWidgetValue={set}
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
});

export default SettingsGroup;
