import { useState } from 'react';
import { FolderIdContext } from './useFolderId';

export default function FolderIdProvider({ children }: Props.WithChildren) {
	const [folderId, setFolderId] = useState('main');

	return (
		<FolderIdContext value={{ folderId, setFolderId }}>
			{children}
		</FolderIdContext>
	);
}
