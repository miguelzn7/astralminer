# AstralMiner - Cosmic Tycoon (Jupiter System)

AstralMiner is a 3D space-based economic simulation and trading game prototype, currently focused on the Jupiter system. Players navigate the Jovian moons, trade resources with various companies, and craft more complex items to build their fortune. This project serves as an exploration of 3D game development with Three.js and dynamic in-game economies.



## Table of Contents

- [Features](#features)
- [Gameplay](#gameplay)
- [Tech Stack](#tech-stack)
- [Setup & Running](#setup--running)
  - [Prerequisites](#prerequisites)
  - [Running Locally](#running-locally)
- [Controls](#controls)
- [Project Structure](#project-structure)
- [Future Ideas / To-Do](#future-ideas--to-do)
- [Contributing (Optional)](#contributing-optional)
- [License (Optional)](#license-optional)

## Features

*   **3D Solar System Navigation:** Explore a visually represented Jupiter system including Jupiter, the Sun (static), and its major moons (Io, Europa, Ganymede, Callisto, and inner moons).
*   **Dynamic Economy:**
    *   Moons host various companies, each producing and consuming specific resources.
    *   Resource prices fluctuate based on supply (company inventory) and demand (company need).
    *   Player trading actions have an immediate, albeit small, impact on prices.
    *   The economy simulates updates periodically in the background.
*   **Resource Trading:** Buy and sell a variety of raw materials and processed goods at different moon markets.
*   **Crafting System:** Combine owned resources to craft more advanced and valuable items according to schematics.
*   **Interactive UI:** Panels for status, selected objects, POI interactions, trading, and crafting.
*   **Camera Controls:** Orbit, zoom, pan, and focus on celestial bodies.

## Gameplay

1.  **Explore:** Use mouse controls to navigate the 3D environment. Double-click on planets or moons to focus the camera.
2.  **Identify Markets:** When focused on a major moon, an "Open Market" button may appear if trading facilities are present. POIs on these moons also grant access to their parent moon's market.
3.  **Trade Resources:**
    *   Open the market panel to see what local companies are buying and selling.
    *   Analyze prices, stock levels (for selling companies), and demand levels (for buying companies).
    *   Buy low, sell high! Transport resources between moons to exploit price differences.
4.  **Craft Items:**
    *   In the "System View" (when not focused on a specific moon/POI), an "Open Crafting" button appears in the status panel.
    *   Review available schematics, check your inventory for required ingredients, and craft items. Crafted items can be sold or used as ingredients for other, more complex recipes.
5.  **Manage Finances:** Keep an eye on your credits and cargo hold capacity (represented by your inventory).

## Tech Stack

*   **HTML5:** Page structure and UI element definitions.
*   **CSS3:** Styling for UI elements.
*   **JavaScript (ES6 Modules):** Core game logic, interactions, and 3D scene management.
*   **Three.js (r164):** 3D graphics library for rendering the space environment, celestial bodies, and effects.

## Setup & Running

### Prerequisites

*   A modern web browser that supports WebGL and ES6 Modules (e.g., Chrome, Firefox, Edge).
*   A local web server to serve the files (due to browser security restrictions with ES Modules loaded via `file:///`).

### Running Locally

1.  **Clone the repository (or download the ZIP):**
    ```bash
    git clone https://github.com/miguelzn7/astralminer.git
    cd astralminer
    ```
2.  **Serve the `index.html` file using a local web server.** Here are a few options:
    *   **Using VS Code & Live Server Extension (Recommended):**
        1.  Open the `astralminer` folder in VS Code.
        2.  Install the "Live Server" extension by Ritwick Dey.
        3.  Right-click `index.html` in the VS Code explorer and select "Open with Live Server."
    *   **Using Python's built-in server:**
        Navigate to the `astralminer` directory in your terminal and run:
        ```bash
        python -m http.server
        ```
        Then open `http://localhost:8000` in your browser.
    *   **Using Node.js & `http-server`:**
        If you have Node.js, install `http-server` globally: `npm install -g http-server`.
        Then, navigate to the `astralminer` directory and run:
        ```bash
        http-server
        ```
        Then open `http://localhost:8080` (or the address it provides) in your browser.

3.  The game should now be running in your browser. Open the browser's developer console (usually F12) to see any logs or errors.

## Controls

*   **Left Mouse Drag:** Orbit the camera around the current focus point.
*   **Mouse Scroll Wheel:** Zoom in / Zoom out.
*   **Right Mouse Drag:** Pan the camera.
*   **WASD Keys (in System View):** Pan the camera.
*   **Double Left Click (on object):** Focus the camera on the clicked celestial body or POI.
*   **Escape (ESC) Key:**
    *   Close any open menu (Crafting, Trading).
    *   If no menu is open, unfocus from a POI to its parent moon.
    *   If focused on a moon, unfocus to the System View (Jupiter).

## Project Structure
Use code with caution.
Markdown
astralminer/
├── index.html # Main HTML file with UI structure and CSS
├── README.md # This file
├── js/ # JavaScript modules
│ ├── constants.js # Physical, economy, and texture constants
│ ├── state.js # Global mutable game state (player, view, focus)
│ ├── sceneSetup.js # Creates 3D objects (planets, moons, POIs, etc.)
│ ├── economyManager.js # Market dynamics, crafting, player transactions
│ ├── uiManager.js # Manages and updates UI panels
│ ├── cameraManager.js # Camera transitions, focus, and WASD movement
│ ├── eventManager.js # Global event listeners (mouse, keyboard)
│ └── main.js # Main application entry point, initializes Three.js, game loop
└── textures/ # Folder for local image textures
├── sun.jpg
├── jupiter.jpg
└── ... (other texture files)
## Future Ideas / To-Do

*   fix POIs
*   add ships and planet travel
*   career mining
*   larger price systems

ball hard

