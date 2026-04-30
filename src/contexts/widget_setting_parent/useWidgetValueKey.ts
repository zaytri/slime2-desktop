import { useMemo } from 'react';
import useWidgetSettingParent from './useWidgetSettingParent';

export default function useWidgetValueKey(id: string) {
	const parentId = useWidgetSettingParent();

	return useMemo(() => {
		return parentId ? getWidgetValueChildKey(parentId, id) : id;
	}, [parentId]);
}

export function getWidgetValueChildKey(parentId: string, id: string) {
	return `${parentId}.${id}`;
}
