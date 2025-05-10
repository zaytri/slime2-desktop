import { WidgetValue } from '@/helpers/json/widgetValues';
import useWidgetValues from './useWidgetValues';
import { useWidgetValuesDispatch } from './useWidgetValuesDispatch';

export function useWidgetValue(key: string): {
	widgetValue: WidgetValue;
	setWidgetValue: (value: WidgetValue) => void;
} {
	const values = useWidgetValues();
	const { set } = useWidgetValuesDispatch();

	return {
		widgetValue: values[key],
		setWidgetValue: (value: WidgetValue) => {
			set(key, value);
		},
	};
}
