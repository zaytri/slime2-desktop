import { WidgetValue, WidgetValues } from '@/helpers/json/widgetValues';
import { createContext, useContext } from 'react';
import { contextErrorMessage, deepCopyObject } from '../common';

type WidgetValuesAction =
	| {
			type: 'set';
			key: string;
			value: WidgetValue;
	  }
	| {
			type: 'set-multiple';
			values: WidgetValues;
	  }
	| {
			type: 'duplicate';
			sourceKey: string;
			newKey: string;
	  };

export const WidgetValuesDispatchContext = createContext<
	React.Dispatch<WidgetValuesAction> | undefined
>(undefined);

export function useWidgetValuesDispatch() {
	const dispatch = useContext(WidgetValuesDispatchContext);

	if (!dispatch) {
		throw new Error(
			contextErrorMessage(
				'useWidgetValuesDispatch',
				'WidgetValuesDispatchContext',
			),
		);
	}

	const set = (key: string, value: WidgetValue) => {
		dispatch({ type: 'set', key, value });
	};

	const setMultiple = (values: WidgetValues) => {
		dispatch({ type: 'set-multiple', values });
	};

	const duplicate = (sourceKey: string, newKey: string) => {
		dispatch({ type: 'duplicate', sourceKey, newKey });
	};

	return { set, setMultiple, duplicate };
}

export function widgetValuesReducer(
	state: WidgetValues,
	action: WidgetValuesAction,
): WidgetValues {
	switch (action.type) {
		case 'set-multiple': {
			const { values } = action;
			const copiedState = deepCopyObject(state);

			// deep copy data
			const newValues: WidgetValues = deepCopyObject(values);

			// set new widget values
			const newState = { ...newValues, ...copiedState };

			return newState;
		}
		case 'set': {
			const { key, value } = action;
			const newState = deepCopyObject(state);

			// deep copy data
			const newValue: WidgetValue = deepCopyObject(value);

			// set new widget value
			newState[key] = newValue;

			return newState;
		}
		case 'duplicate': {
			const { sourceKey, newKey } = action;

			// skip duplication if source value doesn't exist
			if (state[sourceKey] === undefined) return state;

			const newState = deepCopyObject(state);

			// deep copy source data
			const copiedValue: WidgetValue = deepCopyObject(newState[sourceKey]);

			// set new widget value
			newState[newKey] = copiedValue;

			return newState;
		}
	}
}
