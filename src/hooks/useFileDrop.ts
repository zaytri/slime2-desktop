import { appWindow, type FileDropEvent } from '@tauri-apps/api/window';
import { useEffect, useState } from 'react';

export default function useFileDrop() {
  const [fileDropState, setFileDropState] = useState<FileDropEvent>({
    type: 'cancel',
  });

  useEffect(() => {
    let unlisten = () => {};

    async function fileDrop() {
      unlisten = await appWindow.onFileDropEvent(event => {
        setFileDropState(event.payload);
      });
    }

    fileDrop();

    return () => {
      unlisten();
    };
  });

  return fileDropState;
}
