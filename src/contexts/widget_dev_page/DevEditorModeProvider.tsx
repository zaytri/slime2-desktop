import { useState } from 'react';
import { WidgetDevPageContext } from './useDevEditorMode';

export default function DevEditorModeProvider({
	children,
}: Props.WithChildren) {
	const [devPage, setDevPage] = useState<'editor' | 'bot-log' | null>(null);

	return (
		<WidgetDevPageContext value={{ devPage, setDevPage }}>
			{children}
		</WidgetDevPageContext>
	);
}
