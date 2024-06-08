import { readTextFile } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';
import clsx from 'clsx';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import useFileDrop from './hooks/useFileDrop';

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');
  const fileDrop = useFileDrop();

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke('greet', { name }));
  }

  if (fileDrop.type === 'drop' && fileDrop.paths[0]) {
    invoke('unzip', { path: fileDrop.paths[0] });

    // readTextFile(fileDrop.paths[0]).then(contents => {
    //   // JSON.parse can throw an error if not valid JSON, handle that
    //   const parse = JSON.parse(contents);
    //   console.log(parse);
    // });
  }

  return (
    <div
      className={clsx(
        'container',
        fileDrop.type === 'hover' && 'container-hover',
        fileDrop.type === 'drop' && 'container-drop',
      )}
    >
      <h1>Welcome to Tauri!</h1>
    </div>
  );
}

export default App;
