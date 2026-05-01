import { WidgetSettingParentContext } from './useWidgetSettingParent';

export default function WidgetSettingParentProvider({
	id,
	children,
}: Props.WithId<Props.WithChildren>) {
	return (
		<WidgetSettingParentContext value={id}>
			{children}
		</WidgetSettingParentContext>
	);
}
