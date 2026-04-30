import { WidgetValue } from '@/helpers/json/widgetValues';
import type { WidgetSetting } from '@@/json/widgetSettings';
import { useCallback, useMemo } from 'react';
import useWidgetSettingParent from '../widget_setting_parent/useWidgetSettingParent';
import { getWidgetValueChildKey } from '../widget_setting_parent/useWidgetValueKey';
import useWidgetValues from './useWidgetValues';
import { useWidgetValuesDispatch } from './useWidgetValuesDispatch';

export function useWidgetValue(
	key: string,
	condition?: WidgetSetting.BaseSetting['condition'],
): {
	widgetValue: WidgetValue;
	setWidgetValue: (value: WidgetValue) => void;
	conditionsMet: boolean;
} {
	const values = useWidgetValues();
	const parentId = useWidgetSettingParent();
	const { set } = useWidgetValuesDispatch();

	const widgetValue = values[key];

	const setWidgetValue = useCallback((value: WidgetValue) => {
		set(key, value);
	}, []);

	const conditionsMet =
		!condition ||
		Object.entries(condition).every(dependency => {
			const [dependentId, dependentValue] = dependency;
			const trueDependentId = parentId
				? getWidgetValueChildKey(parentId, dependentId)
				: dependentId;

			return values[trueDependentId] === dependentValue;
		});

	return useMemo(() => {
		return {
			widgetValue,
			setWidgetValue,
			conditionsMet,
		};
	}, [widgetValue, setWidgetValue, conditionsMet]);
}
