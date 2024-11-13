import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import clsx from 'clsx';
import { memo, useEffect, useState } from 'react';
const appWindow = getCurrentWebviewWindow()

type FileDropperProps = {
	onFileDrop: (paths: string[]) => void;
};

export default memo(function FileDropper({ onFileDrop }: FileDropperProps) {
	// checks if a file is hovered over anywhere in the window
	const [fileHover, setFileHover] = useState(false);

	useEffect(() => {
		let unlisten = () => {};

		async function fileDropHandler() {
			unlisten = await appWindow.onFileDropEvent(event => {
				setFileHover(event.payload.type === 'hover');

				if (event.payload.type === 'drop') {
					onFileDrop(event.payload.paths);
				}
			});
		}

		fileDropHandler();

		return () => {
			unlisten();
		};
	});

	return (
		<div className={clsx('size-48 bg-blue-400', fileHover && 'bg-pink-400')}>
			feed me
		</div>
	);
});
