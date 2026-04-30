import { WidgetIdContext } from './useWidgetId';

type WidgetIdProviderProps = {
	id: string;
};

export default function WidgetIdProvider({
	id,
	children,
}: Props.WithChildren<WidgetIdProviderProps>) {
	return <WidgetIdContext value={id}>{children}</WidgetIdContext>;
}
