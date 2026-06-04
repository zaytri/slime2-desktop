# Slime2 - https://slime2.stream/

## Setup

Slime2 is a desktop app for Linux, Windows, and macOS built using Tauri, Vite, React, and TypeScript.

Here is what you need to run the app in development mode:

1. Install the Tauri prerequisites: https://tauri.app/start/prerequisites/
   - Just need the system dependencies, Rust, and Node.js; this is not built for mobile so skip the mobile configuration.
2. Run `npm install` to install the base Node dependencies.
3. `cd src-tauri` to enter the backend folder, and run `cargo update` to install the Rust dependencies.
4. `cd ../src-overlay` to enter the overlay server folder, and run `npm install` to install the overlay server's Node dependencies.
5. `cd ..` to return to the project root.
6. `npm start` to start development mode.

If you're using VS Code, it will auto suggest useful extends from [extensions.json](.vscode/extensions.json) and [settings.json](.vscode/settings.json) in the `.vscode` folder.
