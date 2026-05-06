import { useState } from 'react';
import { DevEditorModeContext } from './useDevEditorMode';

export default function DevEditorModeProvider({
	children,
}: Props.WithChildren) {
	const [devEditorMode, setDevEditorMode] = useState(false);

	return (
		<DevEditorModeContext value={{ devEditorMode, setDevEditorMode }}>
			{children}
		</DevEditorModeContext>
	);
}
