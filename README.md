# orbitez

P2E canvas game with NFT pass/skin and DeFi mechanics 
1) Main page - https://staging.orbitez.io/
2) Dashboard - https://staging.orbitez.io/dashboard

## Tech stack

- Backend: Next.js
- Frontend: React + Canvas
- Smart-contracts: Archetype
- Testing: jest, completium-cli
- Deploy: Docker, letsencrypt

Smart-contract addrress: https://better-call.dev/ghostnet/KT1C8WxkBZjD5cjkhcJDySyXL5QBR5xCy1oF/operations

## Game Universe

The player will have to take part in the process of forming solar systems. He will fight for survival by controlling a small little planet, which is gradually gaining mass by collecting particles of matter and other small celestial bodies.
The speed in the game is measured not in minutes, but in hundreds of thousands of years. Thus, one match lasts about 100 thousand years.
Time in the game universe runs its course. Inevitably there appears technologically advanced civilizations. Over time, the game will change Epoches. The initial set of planets represents the First Epoch of "natural planets". The Second Epoch of "wandering planets" will contain worlds modified by a technically advanced civilization. On them, you will find Space elevators, planetary engines, Bussard ramjets, etc. The Third Epoch of "artificial planets" will consist of fully artificial cosmic bodies, such as Dyson spheres and Ringworlds. 
## Transactions flow | Mechanics

1) Mint or buy for 1tez unique orbitoid to get into game
4) Enter battleground lobby with orbitoid NFT and choose bet type: tez or LP token (TODO)
5) 80% goes to TOP 3 players at the time of baking the final block(1 round = 15 blocks in Tezos chain, but it's customazible) battleground bank
7) 10-20% stay on smart-contract balance if we provide game server
8) 0-10% goes to game server owner if he use 1-click game server deployment and game was on his server


## Game Server Deployments
Orbitez allows you to deploy your own game server and optionally a Tezos Node in one click on a cloud Provider of your choice (Currently fully supported are: DigitalOcean. In progress: AWS, GCP, Azure).

Once the server is created you can configure the server parameters and register it in the smart contract of the game - this will allow you to receive 50% of all the fees we collect on every game played.

We leverage Docker hub to securely store images of the orbitez.io game server. 

## Tezos node deployment
Mainnet nodes are often overloaded and/or have high latencies and with many popular projects it gets nearly impossible to mint anything unless you're leveraging your own node.
Our goal is to make deployment of your own Tezos node as simple as possible for the user. Tick a checkbox when deploying a game server with us and we'll bring up your very own Tezos node you can plug & play directly into your Temple wallet. All HTTPS certs are taken care of with use of Ngrok.io.

## Flex points / FAQs
1. How do we prevent forgery of the leaderboard?

We run a custom Oracle on the back end server which communicates with the game server and signs the leaderboard object. Front end only receives signed and packed encoded values of the game state when the game ends - this ensures consistency of data end to end.

2. How do we handle flakiness and slowness of IPFS gateways in global setup?

IPFS gateways have proven to be quite inconsistent and unreliable. Depending on where you are and how loaded gateways are some may perform significantly better than others.
We selected the top 10 IPFS gateway providers and perform a race-test. Whichever gateway provider wins the `Promise.race` gets to serve us our beautiful generative planets inside of the game.


## Planned

- [x] Animated Orbitoid(planet) in action!
- [ ] Play with your own FA2 NFT as a skin in orbitez game (hold 100 ORB token to unlock this feature)
- [ ] ORB token farming (incentivize farmers to bet in LP as good as players to farm with ORB rewards)
- [ ] Liquidity Baking LP(SIRIUS) bets
- [ ] Proof of leaderboard (Merkle tree -> own tzstamp server). 
- [ ] Each block send tx with merkle tree of all player key events in the game
- [ ] Federative servers(matrix protocol or simmilar) with state replication 

## Gameplay

Fight with players from all over the world as you try to become the largest Planet in a solar system! Control your tiny planet and eat other players to grow larger. Mint your own, unique generative planet as NFT to enter the battlefield!


Presentation: https://docs.google.com/presentation/d/1pYjczLbxw6lLJv-t_jSi37i-G3O2qyT-tT-gAGt_x-0/edit

## 💻 Quick start

### 1) Clone the repository

```
git clone https://github.com/stepandra/orb && cd orb
```

### 2) Requirements:

- [node](https://nodejs.org) installed, version 14 or later.

### 3) Build:

```
cd ./orbitez && npm i && npm run build
```
### 4) (Optional) Run for development

Start dev server (frontend):
```
npm install && cd orbitez && npm install
npm run dev
```
Start dev server (backend):
```
cd ./server && yarn && CONTRACT_ADDRESS='KT1C8WxkBZjD5cjkhcJDySyXL5QBR5xCy1oF' SERVER_NAME='NYC' node src/index.js
```

Boot up your local instance of the latest orbitez server and connect it to the room in contract you own.

```
docker run --env CONTRACT_ADDRESS=${contractAddress} --env SERVER_NAME=${roomName} -d -p 8080:8080 -p 88:88 orbitez/orb-game-server-main:latest
```

### 5) Contract tests
#### Requirements:
Install tezos-client(MacOS):
```
brew tap serokell/tezos-packaging-stable https://github.com/serokell/tezos-packaging-stable.git
brew install tezos-client
```

Install tezos-client(Ubuntu):
```
sudo add-apt-repository ppa:serokell/tezos && sudo apt-get update
sudo apt install tezos-client -y
```

Install completium-cli and init it in root directory:
```
npm i @completium/completium-cli -g
completium-cli init
``` 

Install node packages in root directory:
```
npm i
```

Set mockup mode in completium-cli:
```
completium-cli mockup init --protocol PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg
```
Run test
```
npm test
```
<img width="649" alt="Снимок экрана 2023-01-03 в 23 32 55" src="https://user-images.githubusercontent.com/4786779/210452341-35f8e86b-19f6-4cea-8680-d6a400390998.png">


## Contract entrypoints
- `claim_fees` - claim all contract balance [admin]
- `clear_all` -  clear all assets except `leaderboard` [admin]
- `destroy_server` - remove selected server from storage [admin]
- `create_server`
  - Parameters
    - serverd string
    - manag address
    - room_idx string
    - serverurl string
    - bet_size mutez
    - size_v nat
    - game_duration_v nat
- `end_game`
  - Parameters
    - parameter pair
    - room_idb string
    - serverid string
    - packed_outcome bytes
    - signed_outcome signature
- `enter_room`
  - Parameters
    - room_idv string
    - serverid string
- `refund`
  - Parameters
    - room_idq string
    - server_id string
- `remove_room`
  - Parameters
    - room_idn string
    - server_idn string
    

