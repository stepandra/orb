import React, { useEffect, useState } from "react";
import axios from 'axios';
import axiosRetry from 'axios-retry';
import Head from "next/head";
import { CONTRACT_ADDRESS, BOT_WAITING_DELAYS, BASE_TZKT_API_URL, BOTS } from "../constants";
import { useRouter } from "next/router";
import { useTezos } from "@hooks/useTezos";
import { Planet } from "@components/Planet/Planet";
import { Header } from "@components/Header/Header";
import usePlanet from "@hooks/usePlanet";
import { PlanetScripts } from "@components/PlanetScripts/PlanetScripts";
import { useSelectedServerContext } from '@context/SelectedServerContext';

const signalR = require("@microsoft/signalr");
axiosRetry(axios, { retries: 3, retryCondition: () => true });

export default function WaitingRoom() {
    const { Tezos, address } = useTezos();
    const [waitRoom, setWaitRoom] = useState([]);
    const [botRequestDelay, setBotRequestDelay] = useState(null);
    const [roomSize, setRoomSize] = useState(-1);
    const [mintHash, setMintHash] = useState("");
    const router = useRouter();

    const {
        isPlanetInitialized,
        setArePlanetScriptsReady
    } = usePlanet(mintHash);

    const { serverName } = useSelectedServerContext();

    const refund = async () => {
        const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
        await contract.methods.refund(serverName, serverName).send();
        router.push("/dashboard");
    };

    useEffect(() => {
        if (waitRoom.length === 0) return;

        const controller = new AbortController();

        const getBotRequestDelay = async () => {

            // Checking which of the players in the waiting room has the largest entry_block ...
            // .. value - this will be the most recently joined player
    
            let latestJoinedPlayer;
    
            if (waitRoom.length === 1) {
                latestJoinedPlayer = waitRoom[0];
            } else {
                latestJoinedPlayer = waitRoom.reduce(
                    (prevPlayer, currPlayer) => {
                        const prevPlayerEntryBlock = prevPlayer.entry_block.toNumber();
                        const currPlayerEntryBlock = currPlayer.entry_block.toNumber();
    
                        if (prevPlayerEntryBlock >= currPlayerEntryBlock) {
                            return prevPlayer;
                        }
                        return currPlayer;
                    },
                );
            }
    
            // Fetching the block timestamp - this will be the most recent player's joining timestamp
    
            const latestJoinedPlayerBlock = latestJoinedPlayer.entry_block.toNumber();
    
            const { data: latestJoinedPlayerBlockDatetime } = await axios({
                method: "GET",
                url: `/blocks/${latestJoinedPlayerBlock}/timestamp`,
                baseURL: BASE_TZKT_API_URL,
                signal: controller.signal
            });
    
            const latestJoinedTimestamp = new Date(
                latestJoinedPlayerBlockDatetime,
            ).getTime();
    
            const currentTimestamp = Date.now();

            // Calculating the amount of bots on a current server
            const currentServerBotsCount = BOTS.reduce((accumulator, currentBot) => {
                const isBotOnServer = waitRoom.some(
                    (serverPlayer) => serverPlayer.name === currentBot.address
                );
                if (isBotOnServer) {
                    return accumulator + 1;
                } else {
                    return accumulator;
                }
            }, 0);

            // Calculating whether minimum bot joining time have passed since the last player joined

            const timeElapsedSinceLastJoin = currentTimestamp - latestJoinedTimestamp;

            const currBotMinJoinTime = BOT_WAITING_DELAYS[currentServerBotsCount];
    
            if (timeElapsedSinceLastJoin < currBotMinJoinTime) {
                setBotRequestDelay(currBotMinJoinTime - timeElapsedSinceLastJoin);
            } else {
                setBotRequestDelay(0);
            }
        };

        getBotRequestDelay();

        return () => controller.abort();
    }, [ waitRoom ]);

    useEffect(() => {
        if (botRequestDelay === null || waitRoom.length === 0) return;

        const controller = new AbortController();

        const requestAddingBot = async () => {
            try {
                await axios({
                    method: "POST",
                    url: `/api/add-bot/${serverName}`,
                    signal: controller.signal
                });
            } catch (error) {
                console.error(error);
            }
        };

        const botRequestingTimeout = setTimeout(requestAddingBot, botRequestDelay);

        return () => {
            clearTimeout(botRequestingTimeout);
            controller.abort();
        };
    }, [botRequestDelay, waitRoom]);

    useEffect(() => {
        let pollTimeout;

        const poll = async () => {
            const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
            const storage = await contract.storage();
            const contractPlayers = storage.player.valueMap;

            // Filter by server
            const currentServerWaitRoomPlayers = [];

            contractPlayers.forEach((playerData, playerName) => {
                if (playerData.room_id === serverName) {
                    currentServerWaitRoomPlayers.push({
                        name: playerName.match(/[a-zA-Z0-9]+/)?.[0],
                        ...playerData,
                    });
                }
            });

            setMintHash(localStorage.getItem("mintHash"));
            setRoomSize(storage.room.valueMap.get(`"${serverName}"`).size.c[0]);

            if (
                currentServerWaitRoomPlayers.length ===
                storage.room.valueMap.get(`"${serverName}"`).size.c[0]
            ) {
                const endBlock =
                    storage.room.valueMap.get(`"${serverName}"`).finish_block.c[0];
                router.push({
                    pathname: "/hud",
                    query: { endBlock },
                });
            } else {
                setWaitRoom((prevWaitRoom) => {
                    if (JSON.stringify(prevWaitRoom) === JSON.stringify(currentServerWaitRoomPlayers)) {
                        return prevWaitRoom;
                    };

                    return currentServerWaitRoomPlayers;
                });
                pollTimeout = setTimeout(() => poll(), 500);
            }
        };

        poll();

        return () => clearTimeout(pollTimeout);
    }, []);

    return (
        <div className='background'>
            <Head>
                <title>Waiting room - Orbitez.io</title>
            </Head>
            <PlanetScripts onScriptsReady={() => setArePlanetScriptsReady(true)} />

            <Header />

            <main className='page container'>
                <div className='page__left'>
                    <div className='listBlock'>
                        <h2 className='listBlock__title blockTitle'>
                            {roomSize !== -1
                                ? `Waiting for players ${waitRoom.length} / ${roomSize}`
                                : "Loading players list..."}
                        </h2>
                        <ul className='listBlock__list'>
                            {waitRoom.map((player) =>
                                player.name === address ? (
                                    <li
                                        key={player.name}
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            wordWrap: "nowrap",
                                        }}
                                        className='listBlock__item listBlock__item--active'
                                    >
                                        {player.name}
                                    </li>
                                ) : (
                                    <li
                                        key={player.name}
                                        style={{ overflow: "hidden" }}
                                        className='listBlock__item'
                                    >
                                        {player.name}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                </div>

                <div className='page__center'>
                    <div className='planet__wrapper--flex-gap'>
                        <Planet isPlanetReady={isPlanetInitialized} />

                        <a className='btn btn--center' onClick={() => refund()}>
                            Leave room
                        </a>
                    </div>
                </div>

                <div className='page__right'></div>
            </main>
        </div>
    );
}
