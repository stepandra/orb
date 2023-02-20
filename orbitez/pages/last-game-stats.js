import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTezos } from "@hooks/useTezos";
import useTimer from "@hooks/useTimer";
import { useServerContext } from "@context/ServerContext";
import { CONTRACT_ADDRESS } from "../constants";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Header } from "@components/Header/Header";

const signalR = require("@microsoft/signalr");

export default function LastGameStats() {
    const { address, Tezos } = useTezos();
    const addressStateRef = useRef();

    // Storing address state in ref, for it to be read accessible inside ...
    // .. handleEndGameOperation() callback, which runs on "operations" ...
    // .. websocket updates
    addressStateRef.current = address;

    const router = useRouter();

    const { serverName } = useServerContext();
    const { setTimer, remainingSeconds } = useTimer({ cancelOnUnmount: true });

    const { packed, signed, leaderboard } = router.query;

    const [
        isRedirectDialogOpeningRequested,
        setIsRedirectDialogOpeningRequested
    ] = useState(false);

    const [ redirectTitle, setRedirectTitle ] = useState(null);

    const redirectToDashboard = useCallback(() => {
        router.push("/dashboard");
    }, []);

    const openRedirectDialog = useCallback(() => {
        setIsRedirectDialogOpeningRequested(true);

        setTimer(redirectToDashboard, 5000);
    }, [redirectToDashboard]);

    const handleEndGameOperation = useCallback(
        (msg) => {
            const {
                type: operationType,
                data: [
                    {
                        parameter: {
                            entrypoint: operationEntrypoint,
                            value: { serverid: operationServerName }
                        }
                    }
                ]
            } = msg;

            const transactions = msg.data;

            const isCurrentServerEndGameOperation =
                operationType === 1 &&
                operationEntrypoint === "end_game" &&
                operationServerName === serverName;

            if (!isCurrentServerEndGameOperation) return;

            const currentPlayerTransaction = transactions.find(
                (transaction) => {
                    return (
                        transaction.target.address === addressStateRef.current
                    );
                }
            );

            // Redirecting if another player has already claimed rewards
            if (!currentPlayerTransaction) {
                setRedirectTitle("You didn't make it into top 3 this game.\nBetter luck next time!");
                openRedirectDialog();
                return;
            };

            const transactionAmount = currentPlayerTransaction.amount / 1e6;

            setRedirectTitle(`Congratulations! You have earned ${transactionAmount} ꜩ`);
            openRedirectDialog();
        },
        [serverName, addressStateRef]
    );

    useEffect(() => {
        let isMounted = true;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://api.ghostnet.tzkt.io/v1/ws")
            .build();

        async function init() {
            try {
                await connection.start();
                await connection.invoke("SubscribeToOperations", {
                    address: CONTRACT_ADDRESS,
                    type: "transaction"
                });
            } catch (error) {
                console.log(error);
            }
        }

        // auto-reconnect
        connection.onclose(() => {
            // Preventing websocket connection from starting when the ...
            // .. component is unmounted. This is necessary because ...
            // .. onclose() method will be triggered even if the component ...
            // ..has been unmounted.
            if (!isMounted) return;

            init();
        });

        connection.on("operations", handleEndGameOperation);

        init();

        return () => {
            isMounted = false;
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

    const darkTheme = createTheme({ palette: { mode: 'dark' } });

    const isRedirectingDialogOpen = useMemo(
        () =>
            isRedirectDialogOpeningRequested &&
            redirectTitle !== null &&
            remainingSeconds !== null,
        [isRedirectDialogOpeningRequested, redirectTitle, remainingSeconds]
    );

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
                <ThemeProvider theme={darkTheme}>
                    <Dialog
                        open={isRedirectingDialogOpen}
                        onClose={redirectToDashboard}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        sx={{ '& .MuiDialog-paper': {
                            padding: "1rem",
                            backgroundColor: "rgba(42, 46, 94, 0.9)",
                            backgroundImage: "none"
                        } }}
                    >
                        <DialogTitle
                            id="alert-dialog-title"
                            sx={{
                                whiteSpace: "pre-line",
                                textAlign: "center"
                            }}
                        >
                            {redirectTitle}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText
                                id="alert-dialog-description"
                                sx={{ textAlign: "center" }}
                            >
                                {`Redirecting to Dashboard in ${remainingSeconds}...`}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions sx={{justifyContent: "center"}}>
                            <button onClick={redirectToDashboard} className="btn btn--center btn--small">
                                Go to Dashboard
                            </button>
                        </DialogActions>
                    </Dialog>
                </ThemeProvider>
            </main>
        </div>
    );
}
