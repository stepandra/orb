# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_No changes since latest release_

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

### Added

- In-game leaderboard;
- Food & virus skins;
- Game Progress Timer.

### Changed
- Updated README.md.

[unreleased]: https://github.com/stepandra/orb/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/stepandra/orb/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/stepandra/orb/releases/tag/v0.0.1
