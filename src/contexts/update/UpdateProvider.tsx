import { check, type Update } from '@tauri-apps/plugin-updater';
import { useEffect, useState } from 'react';
import { UpdateContext } from './useUpdate';

export default function UpdateProvider({ children }: Props.WithChildren) {
	const [update, setUpdate] = useState<Update | null>(null);

	useEffect(() => {
		async function findUpdate() {
			const update = await check().catch(() => null);
			if (update) {
				setUpdate(update);
			}
		}

		findUpdate();
	}, []);

	return <UpdateContext value={update}>{children}</UpdateContext>;
}
