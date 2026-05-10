import type { WidgetSettings } from '@@/json/widgetSettings';
import { WidgetSettingsEditorContext } from './useWidgetSettingsEditor';
import {
	WidgetSettingsEditorDispatchContext,
	type WidgetSettingsEditorAction,
} from './useWidgetSettingsEditorDispatch';

type WidgetSettingsEditorProviderProps = {
	state: WidgetSettings;
	dispatch: React.ActionDispatch<[action: WidgetSettingsEditorAction]>;
};

export default function WidgetSettingsEditorProvider({
	state,
	dispatch,
	children,
}: Props.WithChildren<WidgetSettingsEditorProviderProps>) {
	return (
		<WidgetSettingsEditorDispatchContext value={dispatch}>
			<WidgetSettingsEditorContext value={state}>
				{children}
			</WidgetSettingsEditorContext>
		</WidgetSettingsEditorDispatchContext>
	);
}
