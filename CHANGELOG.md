# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_No changes since the latest release._

## [0.3.3] - 2023-03-08

### Changed

- Refactored planet rendering:
  - Implemented the ability to render multiple different planets at the same time;
  - Added the ability to render directly into a custom canvas (via passing of the canvas element ref);
  - Added the ability to render by-frame into internal (not mounted) canvas with specified parameters and returning the canvas for custom drawing;
  - Improved `<Planet />` component, which now can be used without any preliminary setup, by simply providing a `mintHash` prop;
  - Improved `<PlanetDataList />` component;
  - Redesigned planet rendering initialization and getting of planet features to be fully synchronous instead of asynchronous;
  - Added the ability to render a planet without a background and take 100% of the width and height of the canvas;
- Game optimizations to ensure stable high FPS:
  - Implemented usage of shared single WebGl context to improve performance;
  - Implemeted reusing of a single planet render for all smaller planet cells;
  - Implemented limiting amount of food cells to be rendered on a large zoom out;
  - Limited max zoom-out;
  - Optimized food skin rendering;
  - Implemented limiting of planet rendering FPS animation;
  - Disabled jelly physics;
- Server config:
  - Max zoom out changed from 0.15 to 0.35;
  - Min food size changed from 5 to 1;
  - Max food size changed from 15 to 25;
  - Food amount reduced from 15000 to 3000;
  - Eating food gives 3 times more of foods original mass;
  - Amount of virus cells changed from 50 to 30;
  - Max size of player increased from 400 to 489.897948557;
  - Max cells of player reduced from 16 to 10;
  - Player speed increased by 1.5 times (1 -> 1.5).

### Added

- Animated planets in-game.

### Removed

- jQuery dependency;
- seedRandom dependency;
- Loading of skins via IPFS.

### Fixed

- Bots requests retries sometimes failing bug;
- Game progress timer optimistic updates exceeding the limits bug.

## [0.3.2] - 2023-02-28

### Added

- Implemented the ability to join local dev game server via usage of env variables;
- New non-linear bot addition logic.

### Fixed

- Game progress timer receiving not valid data bug.

## [0.3.1] - 2023-02-27

### Changed

- Updated contract address to: `KT1QQnpFLKtUwLDTPofnudfPdmCuBmtmQkrz`;
- Updated README.md.

## [0.3.0] - 2023-02-16

### Changed

- Improved `<WaitingRoom />` page component by implementing triggering of re-render only when the player list changes, instead of re-rendering every time the data is fetched;
- Improved killing of not allowed players on the game server (checking and killing of unauthorized players are now carried out on every game tick);
- Modified Orbitez Docker Image CI workflow for a manual trigger only;
- Updated launch scripts;
- Updated `README.md` (`staging.orbitez.io` -> `orbitez.io`);
- Reduced the playing area on the game server by half (from `200000000` to `100000000`);
- Updated the old contract address to the new one.

### Added

- **Bot addition functionality**, if players are waiting too long:
  - Created 7 bots and supplied them with `100 XTZ` each from the faucet and a planet NFT;
  - Created `/api/add-bot/{serverName}` POST API endpoint for requesting bot addition;
  - Implemented bot addition logic;
  - Implemented caching of pending bot addition requests to prevent double requests;
  - Implemented storage of bots' private keys and addresses in env variables.
  - Implemented bot requesting logic in `<WaitingRoom />` page component:
    - request delay will be calculated based on latest player joining time;
    - added request retrying;
  - Implemented bot spawning / killing logic on the game server;
  - Implemented the display of bot skins;
- Set up unit testing with `Jest` and `React Testing Library`;
- Added some unit tests;
- Created a production workflow for deployment to production, which can only be triggered manually from the `Actions` tab;
- Implemented the possibility to launch game and servers on custom ports;
- Implemented **Server Selector**;
- Added `@mui/icons-material` package (for icons).

### Fixed

- Fixed using of `http` over `https` with `statsUrl` in `/api/get-signed-leaderboard`;
- Fixed leaderboard not being sorted on `/last-game-stats page`;
- Fixed not returning a value in `useContractServers.js` file `contractServerList.findIndex()` array method;
- Fixed local git repos on deployment machine being out of sync with origin;
- Added auth to git fetch in workflows;
- Fixed overflowing grid areas in `<Dashboard />` page component.

## [0.2.2] - 2023-02-28

### Added

- Implemented the ability to join local dev game server via usage of env variables.

### Fixed

- Game progress timer receiving not valid data bug.

## [0.2.1] - 2023-02-27

### Changed

- Updated contract address to: `KT1QQnpFLKtUwLDTPofnudfPdmCuBmtmQkrz`;
- Updated README.md.

## [0.2.0] - 2023-02-12

### Changed

- Updated contract address to: `KT1WEVRHFcRq8n9iefMNm2s9P2gbB1d5gVzH`;
- Optimized and cleaned-up `useTezos()` hook and `<Dashboard />` page component;
- Improved "connecting" modal layout in `/hud` page;
- Removed game server config from `.gitignore`;
- Implemented `<WaitingRoom />` and `<Hud />` components optimizations.

### Added

- Implemented automatic setting up of subdomains on orbitez.io and Let's Encrypt SSL certificates for user deployed game servers;
- Kicking of duplicated and unregistered users from the game server;
- Implemented restricted access to the `/hud` route. Access conditions:
  - being logged in;
  - having a selected server;
- Storing the selected server in the app context and localStorage (instantly synced);
- Implemented redirecting players from `/last-game-stats` when someone else hits "claim rewards";
- Added a modal window with redirect countdown and a display of game earnings when someone else hits "claim rewards".

### Removed

- Ngrok dependency.

### Fixed

- Fixed a bug which caused the balance to not be updated instantly when changing the wallet address (when logging in/out);
- Fixed address not being instantly set to localStorage when logging in;
- Fixed a bug where the wrong planet was rendered on the `/hud` page shortly before the correct planet was displayed;
- Fixed small inaccuracies when regenerating NFT's render and planet data from mintHash;
- Fixed game server endpoint not updating when changed in contract;
- Fixed in-game leaderboard overlaying welcome dialog in `/hud` page;
- Fixed incorrect planet layout in the `/waiting-room` page;
- Fixed DO Deployed servers don't proxy WebSocket bug;
- Fixed ESLint conflicting configs;
- Fixed not consistently correct values in `<Hud />`;
- Fixed hardcoded server stats URL in `/api/get-signed-leaderboard` and implemented passing of it through query parameters;
- Fixed a bug that caused incorrect data to be returned from the `useGameProgressTimer()` hook to the `<GameProgressTimer />` component, which caused `RangeError: invalid array length`.

## [0.1.0] - 2023-01-16

### Changed

- Updated README.md.

### Added

- In-game leaderboard;
- Food & virus skins;
- Game Progress Timer.

[unreleased]: https://github.com/stepandra/orb/compare/v0.3.3...HEAD
[0.3.3]: https://github.com/stepandra/orb/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/stepandra/orb/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/stepandra/orb/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/stepandra/orb/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/stepandra/orb/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/stepandra/orb/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/stepandra/orb/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/stepandra/orb/releases/tag/v0.1.0
