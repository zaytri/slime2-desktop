import { createContext, useContext } from 'react';

export const WidgetSettingParentContext = createContext<string | undefined>(
	undefined,
);

export default function useWidgetSettingParent() {
	return useContext(WidgetSettingParentContext);
}
