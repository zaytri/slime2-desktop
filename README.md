# Slime2 - https://slime2.stream/

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/V7V14PTBF)

## Setup

Slime2 is a desktop app for Linux, Windows, and macOS built using Tauri, Vite, React, and TypeScript.

Here is what you need to run the app in development mode:

1. Install the Tauri prerequisites: https://tauri.app/start/prerequisites/
   - Just need the system dependencies, Rust, and Node.js; this is not built for mobile so skip the mobile configuration.
   - For Linux, will also need to install GStreamer.
     - Fedora/Ubuntu/Debian instructions: https://gstreamer.freedesktop.org/documentation/installing/on-linux.html?gi-language=c
     - Arch Linux instructions: https://wiki.archlinux.org/title/GStreamer (install all of the common package set)
2. Run `npm install` to install the base Node dependencies.
3. `cd src-tauri` to enter the backend folder, and run `cargo update` to install the Rust dependencies.
4. `cd ../src-overlay` to enter the overlay server folder, and run `npm install` to install the overlay server's Node dependencies.
5. `cd ..` to return to the project root.
6. `npm start` to start development mode.
   - Sometimes this fails and it shows being unable to delete something as part of the pre-start cleanup; usually you can just run it again and it'll work. Also make sure you don't already have the app running.

> When updating built-in widgets in `/resources/widgets`, you will need to close the app and run `npm start` again, since it only sets the `resources` folder upon initialization. Also, the widgets won't auto update, you will need to install a fresh version of the updated widget on a new tile.

> If you're using VS Code, it will auto suggest useful extends from [extensions.json](.vscode/extensions.json) and [settings.json](.vscode/settings.json) in the `.vscode` folder.
