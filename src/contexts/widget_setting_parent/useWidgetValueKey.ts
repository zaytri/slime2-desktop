import { useContext } from 'react';
import { WidgetSettingParentContext } from './useWidgetSettingParent';

export default function useWidgetValueKey(id: string) {
	const parentId = useContext(WidgetSettingParentContext);

	return parentId ? getWidgetValueChildKey(parentId, id) : id;
}

export function getWidgetValueChildKey(parentId: string, id: string) {
	return `${parentId}.${id}`;
}
