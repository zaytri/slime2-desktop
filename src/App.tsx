import { readTextFile } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';
import { FileDropEvent, appWindow } from '@tauri-apps/api/window';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');
  const [dragAndDropState, setDragAndDropState] =
    useState<FileDropEvent['type']>('cancel');
  const [filePath, setFilePath] = useState('');

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke('greet', { name }));
  }

  useEffect(() => {
    let unlisten = () => {};

    async function dragAndDrop() {
      unlisten = await appWindow.onFileDropEvent(event => {
        setDragAndDropState(event.payload.type);

        switch (event.payload.type) {
          case 'hover':
            {
            }
            break;
          case 'drop':
            {
              setFilePath(event.payload.paths[0]);
            }
            break;
          default: {
          }
        }
      });
    }

    dragAndDrop();

    return () => {
      unlisten();
    };
  });

  if (filePath) {
    readTextFile(filePath).then(contents => {
      // JSON.parse can throw an error if not valid JSON, handle that
      const parse = JSON.parse(contents);
      console.log(parse);
    });
  }

  return (
    <div
      className={clsx(
        'container',
        dragAndDropState === 'hover' && 'container-hover',
        dragAndDropState === 'drop' && 'container-drop',
      )}
    >
      <h1>Welcome to Tauri!</h1>

      <div className='row'>
        <a href='https://vitejs.dev' target='_blank'>
          <img src='/vite.svg' className='logo vite' alt='Vite logo' />
        </a>
        <a href='https://tauri.app' target='_blank'>
          <img src='/tauri.svg' className='logo tauri' alt='Tauri logo' />
        </a>
        <a href='https://reactjs.org' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className='row'
        onSubmit={e => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id='greet-input'
          onChange={e => setName(e.currentTarget.value)}
          placeholder='Enter a name...'
        />
        <button type='submit'>Greet</button>
      </form>

      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
