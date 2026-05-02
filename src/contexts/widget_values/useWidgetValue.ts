import { getWidgetValueChildKey } from '../widget_setting_parent/useWidgetValueKey';
import useWidgetValues from './useWidgetValues';

export function useWidgetValue(key: string) {
	const values = useWidgetValues();

	function getSubValue(subKey: string) {
		return values[getWidgetValueChildKey(key, subKey)];
	}

	return {
		widgetValue: values[key],
		getSubValue,
	};
}
