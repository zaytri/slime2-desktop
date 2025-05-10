import {
	loadWidgetValues,
	saveWidgetValues,
} from '@/helpers/json/widgetValues';
import { memo, useEffect, useReducer, useState } from 'react';
import { WidgetValuesContext } from './useWidgetValues';
import {
	WidgetValuesDispatchContext,
	widgetValuesReducer,
} from './useWidgetValuesDispatch';

type WidgetValuesProviderProps = {
	id: string;
};

const WidgetValuesProvider = memo(function WidgetValuesProvider({
	children,
	id,
}: Props.WithChildren<WidgetValuesProviderProps>) {
	const [widgetValues, dispatch] = useReducer(widgetValuesReducer, {});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function getWidgetValues() {
			const values = await loadWidgetValues(id);
			dispatch({ type: 'set-multiple', values });
			setLoading(false);
		}

		getWidgetValues();
	}, []);

	// save on every widgetValue change after load
	useEffect(() => {
		if (!loading) {
			saveWidgetValues(id, widgetValues);
		}
	}, [widgetValues, loading]);

	return (
		<WidgetValuesContext value={widgetValues}>
			<WidgetValuesDispatchContext value={dispatch}>
				{children}
			</WidgetValuesDispatchContext>
		</WidgetValuesContext>
	);
});

export default WidgetValuesProvider;
