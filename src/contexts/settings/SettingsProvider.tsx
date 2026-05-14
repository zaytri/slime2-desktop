import {
	DEFAULT_SETTINGS,
	saveSettings,
	type Settings,
} from '@/helpers/json/settings';
import { useSettingsQuery } from '@/hooks/useSettingsQuery';
import { useEffect, useState } from 'react';
import { SettingsContext } from './useSettings';

export default function SettingsProvider({ children }: Props.WithChildren) {
	const { data } = useSettingsQuery();
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

	useEffect(() => {
		if (data) {
			setSettings(data);
		}
	}, [data]);

	function save(settings: Settings) {
		setSettings(settings);
		saveSettings(settings);
	}

	return (
		<SettingsContext value={{ settings, setSettings: save }}>
			{children}
		</SettingsContext>
	);
}
