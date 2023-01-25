import React, { useEffect, useState } from "react";
import Head from "next/head";
import { CONTRACT_ADDRESS } from "../constants";
import { useRouter } from "next/router";
import { useTezos } from "@hooks/useTezos";
import { Planet } from "@components/Planet/Planet";
import { Header } from "@components/Header/Header";
import usePlanet from "@hooks/usePlanet";
import { PlanetScripts } from "@components/PlanetScripts/PlanetScripts";
import { useServerContext } from '@context/ServerContext';

const signalR = require("@microsoft/signalr");

export default function WaitingRoom() {
    const { Tezos, address } = useTezos();
    const [waitRoom, setWaitRoom] = useState([]);
    const [roomSize, setRoomSize] = useState(-1);
    const [mintHash, setMintHash] = useState("");
    const router = useRouter();

    const {
        isPlanetInitialized,
        setArePlanetScriptsReady
    } = usePlanet(mintHash);

    const { serverName } = useServerContext();

    const refund = async () => {
        const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
        await contract.methods.refund(serverName, serverName).send();
        router.push("/dashboard");
    };

    useEffect(() => {
        let pollTimeout;

        const poll = async () => {
            const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
            const storage = await contract.storage();
            setMintHash(localStorage.getItem("mintHash"));
            setRoomSize(storage.room.valueMap.get(`"${serverName}"`).size.c[0]);
            const players = [];
            for (let [key, value] of storage.player.valueMap) {
                if (value.room_id === serverName) {
                    players.push(key.replaceAll('"', ""));
                }
            }

            if (
                players.length ===
                storage.room.valueMap.get(`"${serverName}"`).size.c[0]
            ) {
                const endBlock =
                    storage.room.valueMap.get(`"${serverName}"`).finish_block.c[0];
                router.push({
                    pathname: "/hud",
                    query: { endBlock },
                });
            } else {
                setWaitRoom(players);
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
                            {waitRoom.map((el) =>
                                el === address ? (
                                    <li
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            wordWrap: "nowrap",
                                        }}
                                        className='listBlock__item listBlock__item--active'>
                                        {el}
                                    </li>
                                ) : (
                                    <li
                                        style={{ overflow: "hidden" }}
                                        className='listBlock__item'>
                                        {el}
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
