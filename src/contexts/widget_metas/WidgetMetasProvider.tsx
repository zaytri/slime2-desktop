import { loadWidgetMeta } from '@/helpers/json/widgetMeta';
import { memo, useCallback, useEffect, useReducer } from 'react';
import useTileLocations from '../tile_locations/useTileLocations';
import { WidgetMetasContext } from './useWidgetMetas';
import {
	WidgetMetasDispatchContext,
	widgetMetasReducer,
} from './useWidgetMetasDispatch';

const WidgetMetasProvider = memo(function WidgetMetasProvider({
	children,
}: Props.WithChildren) {
	const locations = useTileLocations();
	const [widgetMetas, dispatch] = useReducer(widgetMetasReducer, {});

	const getWidgetMeta = useCallback(
		async (id: string) => {
			const meta = await loadWidgetMeta(id);
			dispatch({ type: 'set', id, meta });
		},
		[dispatch],
	);

	useEffect(() => {
		async function loadWidgetMetas() {
			const loadPromises: Promise<void>[] = [];

			// loop thru all location ids, loading widget metas if they don't
			// already exist in the widget metas map
			Object.keys(locations).forEach(id => {
				if (id.startsWith('widget_') && !widgetMetas[id]) {
					loadPromises.push(getWidgetMeta(id));
				}
			});

			// simultaneously load widget metas
			await Promise.all(loadPromises);
		}

		loadWidgetMetas();
	}, [locations, widgetMetas]);

	return (
		<WidgetMetasContext value={widgetMetas}>
			<WidgetMetasDispatchContext value={dispatch}>
				{children}
			</WidgetMetasDispatchContext>
		</WidgetMetasContext>
	);
});

export default WidgetMetasProvider;
