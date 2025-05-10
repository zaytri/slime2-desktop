import { memo } from 'react';
import { WidgetSettingParentContext } from './useWidgetSettingParent';

const WidgetSettingParentProvider = memo(function WidgetSettingParentProvider({
	id,
	children,
}: Props.WithId<Props.WithChildren>) {
	return (
		<WidgetSettingParentContext value={id}>
			{children}
		</WidgetSettingParentContext>
	);
});

export default WidgetSettingParentProvider;
