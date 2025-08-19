import { WidgetMeta } from '@/helpers/json/widgetMeta';
import useWidgetMetas from './useWidgetMetas';
import { useWidgetMetasDispatch } from './useWidgetMetasDispatch';

export function useWidgetMeta(id: string) {
	const widgetMetas = useWidgetMetas();
	const { set } = useWidgetMetasDispatch();

	if (!id) throw new Error('useWidgetMeta used with an invalid ID!');

	return {
		widgetMeta: widgetMetas[id],
		setWidgetMeta: (meta: WidgetMeta) => {
			set(id, meta);
		},
	};
}
