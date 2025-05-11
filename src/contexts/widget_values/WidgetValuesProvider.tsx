import { WidgetSettings } from '@/helpers/json/widgetSettings';
import {
	loadWidgetValues,
	saveWidgetValues,
} from '@/helpers/json/widgetValues';
import { sendWidgetValues } from '@/helpers/websocket';
import { memo, useEffect, useReducer, useState } from 'react';
import { WidgetValuesContext } from './useWidgetValues';
import {
	WidgetValuesDispatchContext,
	widgetValuesReducer,
} from './useWidgetValuesDispatch';

type WidgetValuesProviderProps = {
	id: string;
	settings: WidgetSettings;
};

const WidgetValuesProvider = memo(function WidgetValuesProvider({
	children,
	settings,
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

	// send and save on every widgetValue change after load
	useEffect(() => {
		if (!loading) {
			sendWidgetValues(id, settings, widgetValues);
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
