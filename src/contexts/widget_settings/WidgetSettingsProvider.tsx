import {
	loadWidgetSettings,
	WidgetSettings,
} from '@/helpers/json/widgetSettings';
import { memo, useEffect, useState } from 'react';
import { WidgetSettingsContext } from './useWidgetSettings';

type WidgetSettingsProps = {
	id: string;
};

const WidgetSettingsProvider = memo(function WidgetSettingsProvider({
	id,
	children,
}: Props.WithChildren<WidgetSettingsProps>) {
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(true);
	const [settings, setSettings] = useState<WidgetSettings>([]);

	useEffect(() => {
		async function loadSettings() {
			const data = await loadWidgetSettings(id).catch(error => {
				console.error(error);
				return null;
			});

			if (data === null) {
				setError(true);
			} else {
				setSettings(data);
			}

			setLoading(false);
		}

		loadSettings();
	}, [id]);

	return (
		<WidgetSettingsContext value={{ loading, error, settings }}>
			{children}
		</WidgetSettingsContext>
	);
});

export default WidgetSettingsProvider;
