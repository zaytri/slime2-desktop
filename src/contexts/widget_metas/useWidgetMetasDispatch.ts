import { saveWidgetMeta, WidgetMeta } from '@/helpers/json/widgetMeta';
import { createContext, useContext } from 'react';
import { contextErrorMessage, deepCopyObject } from '../common';
import { WidgetMetas } from './useWidgetMetas';

type WidgetMetasAction = { type: 'set'; id: string; meta: WidgetMeta };

export const WidgetMetasDispatchContext = createContext<
	React.Dispatch<WidgetMetasAction> | undefined
>(undefined);

export function useWidgetMetasDispatch() {
	const dispatch = useContext(WidgetMetasDispatchContext);

	if (!dispatch) {
		throw new Error(
			contextErrorMessage(
				'useWidgetMetasDispatch',
				'WidgetMetasDispatchContext',
			),
		);
	}

	const set = (id: string, meta: WidgetMeta) => {
		dispatch({ type: 'set', id, meta });
	};

	return { set };
}

export function widgetMetasReducer(
	state: WidgetMetas,
	action: WidgetMetasAction,
): WidgetMetas {
	switch (action.type) {
		case 'set': {
			const { id, meta } = action;
			const newState = deepCopyObject(state);

			// deep copy new data
			const newMeta: WidgetMeta = deepCopyObject(meta);

			// add new widget meta
			newState[id] = newMeta;

			saveWidgetMeta(id, newMeta);
			return newState;
		}
	}
}
