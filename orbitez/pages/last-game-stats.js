import React, { useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTezos } from "@hooks/useTezos";
import { useServerContext } from "@context/ServerContext";
import { CONTRACT_ADDRESS } from "../constants";

import { Header } from "@components/Header/Header";

const signalR = require("@microsoft/signalr");

export default function LastGameStats() {
    const { address, Tezos } = useTezos();
    const router = useRouter();

    const { serverName } = useServerContext();

    const { packed, signed, leaderboard } = router.query;

    const isMounted = useRef(false);

    const handleEndGameOperation = useCallback((msg) => {
        const {
            type: operationType,
            data: [
                {
                    parameter: {
                        entrypoint: operationEntrypoint,
                        value: {
                            serverid: operationServerName
                        }
                    },
                },
            ],
        } = msg;

        const isCurrentServerEndGameOperation = (
            operationType === 1 &&
            operationEntrypoint === "end_game" &&
            operationServerName === serverName
        );

        if (!isCurrentServerEndGameOperation) return;

        // Redirect if another player has already claimed rewards
        router.push("/dashboard");
    }, [serverName, router]);

    useEffect(() => {
        isMounted.current = true;

        return () => isMounted.current = false;
    }, []);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://api.ghostnet.tzkt.io/v1/ws")
            .build();

        async function init() {
            if (!isMounted.current) return;

            try {
                await connection.start();
                await connection.invoke("SubscribeToOperations", {
                    address: CONTRACT_ADDRESS,
                    type: 'transaction',
                });
            } catch(error) {
                console.log(error);
            }
        }

        // auto-reconnect
        connection.onclose(init);

        connection.on("operations", handleEndGameOperation);

        init();

        return () => {
            connection.off("SubscribeToOperations");
            connection.stop();
        };
    }, []);

    const payDividends = useCallback(async () => {
        const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
        await contract.methods
            .end_game(serverName, serverName, packed, signed)
            .send({ storageLimit: 1000 });
        router.push("/dashboard");
    }, [Tezos, serverName, packed, signed, router]);

    return (
        <div className="background">
            <Head>
                <title>Game Winners - Orbitez.io</title>
            </Head>
            <Header />
            <main className="container container--small">
                <div className="statList statList--wide">
                    <ul className="statList__list">
                        {leaderboard &&
                            JSON.parse(leaderboard).map((player, index) => (
                                <li
                                    key={player.address}
                                    className={`statList__item ${
                                        address === player.address
                                            ? "statList__item--active"
                                            : ""
                                    }`}
                                >
                                    <p className="statList__rank">
                                        {index + 1}
                                    </p>
                                    <p className="statList__nft">
                                        {player.address}
                                    </p>
                                    <p className="statList__score">
                                        {player.amount}
                                    </p>
                                </li>
                            ))}
                    </ul>
                </div>
                <a onClick={payDividends} className="btn btn--center">
                    Claim Rewards
                </a>
                <a
                    onClick={() => router.push("/dashboard")}
                    className="btn btn--center"
                    style={{ marginTop: "2rem" }}
                >
                    Dashboard
                </a>
            </main>
        </div>
    );
}
