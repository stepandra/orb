import axios from "axios";
import React, { useEffect, useMemo, useState, useRef } from "react";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/router";
import { CONTRACT_ADDRESS } from "../constants";

import { renderInner } from "@components/agar-client/agar-client-html";
import InGameLeaderboard from "@components/InGameLeaderboard/InGameLeaderboard";
import { route } from "next/dist/server/router";

import { useServerContext } from "@context/ServerContext";
import RouteGuard from "@components/RouteGuard/RouteGuard";

const signalR = require("@microsoft/signalr");

function Hud() {
    const [endBlock, setEndBlock] = useState(0);
    const [currentBlock, setCurrentBlock] = useState(0);
    const [shouldRenderMain, setShouldRenderMain] = useState(false);
    const router = useRouter();

    const isMounted = useRef(false);

    const { serverName, serverUrl, statsUrl } = useServerContext();

    useEffect(() => {
        const gateway =
            localStorage.getItem("ipfs-gateway") || "gateway.ipfs.io";
        if (!localStorage.getItem("skinLink")) {
            localStorage.setItem(
                "skinLink",
                `https://${gateway}/ipfs/QmaXjh2fxGMN4LmzmHMWcjF8jFzT7yajhbHn7yBN7miFGi`
            );
            router.reload();
        }
    }, []);

    const isGameFinished = useMemo(() => {
        console.log(
            endBlock,
            currentBlock,
            Number(currentBlock) > Number(endBlock)
        );
        return (
            endBlock && currentBlock && Number(currentBlock) > Number(endBlock)
        );
    }, [endBlock, currentBlock]);

    useEffect(() => {
        let shouldRedirect = true;

        const redirectWithLeaderboard = async () => {
            shouldRedirect = false;

            const res = await axios.post("/api/get-signed-leaderboard", {
                serverName,
                statsUrl
            });

            router.push({
                pathname: `/last-game-stats`,
                query: {
                    packed: res.data.packed,
                    signed: res.data.sig,
                    leaderboard: JSON.stringify(res.data.leaderboard),
                },
            });
        };

        if (isGameFinished && shouldRedirect) {
            redirectWithLeaderboard();
        }
    }, [currentBlock, isGameFinished]);

    useEffect(() => {
        const renderMain = () => {
            const shouldRenderTimeout = setTimeout(() => {
                setShouldRenderMain(true);
            }, 800);
    
            return { shouldRenderTimeout };
        };

        const windowInitTimeout = setTimeout(() => {
            window.init();
        }, 900);
        const { shouldRenderTimeout } = renderMain();

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://api.ghostnet.tzkt.io/v1/events") //https://api.tzkt.io/ MAINNEt
            .build();

        async function init() {
            if (!isMounted.current) return;

            // open connection
            await connection.start();
            // subscribe to head
            await connection.invoke("SubscribeToBlocks");
        }

        // auto-reconnect
        connection.onclose(init);

        connection.on("blocks", (msg) => {
            console.log("block", msg.state);
            setCurrentBlock(msg.state);
        });

        init();

        return () => {
            connection.off("SubscribeToBlocks");
            connection.stop();
            clearTimeout(windowInitTimeout);
            clearTimeout(shouldRenderTimeout);
        };
    }, []);

    const renderMain = () => {
        setTimeout(() => {
            setShouldRenderMain(true);
        }, 800);
    };

    return (
        <>
            <Head>
                <title>Hud - Orbitez.io</title>
            </Head>

            {/* <div className="overlay" id="deadPlayer">
                <div className="popUp">
                    <a className="popUp__close" href="#close"></a>
                    <p className="popUp__title">You are dead</p>
                    <div className="popUp__content">
                        <p className="popUp__text">End of match in:</p>
                        <p className="popUp__timer">10:15:00</p>
                    </div>
                    <a className="popUp__btn btn btn--center">RESPAWN</a>
                </div>
            </div> */}

            {/* <div className="overlay" id="processing"> 
                <div className="popUp">
                    <a className="popUp__close" href="#close"></a>
                    <p className="popUp__title">PROCESSING...</p>
                    <div className="popUp__content">
                        <p className="popUp__text">Start in:</p>
                        <p className="popUp__timer">07 sec</p>
                    </div>
                </div>
            </div> */}

            {/* <div className="overlay" id="youWin" href="#close">
                <div className="gamePopUp">
                    <p className="gamePopUp__title">Match Results</p>
                    <p className="gamePopUp__result">You WIN</p>
                    <p className="gamePopUp__number">TEZ   250,000015</p>
                    <p className="gamePopUp__numPlus">+ 0,0015</p> {/* if lose add className: gamePopUp__numPlus--lose }
                    <div className="gamePopUp__content">
                        <div className="gamePopUp__block">
                            <div className="gamePopUp__row">
                                <p className="gamePopUp__text">Food eaten</p>
                                <p className="gamePopUp__value">12%</p>
                            </div>
                            <div className="gamePopUp__row">
                                <p className="gamePopUp__text">Time alive</p>
                                <p className="gamePopUp__value">43:07:40</p>
                            </div>
                            <div className="gamePopUp__row">
                                <p className="gamePopUp__text">Cells eaten</p>
                                <p className="gamePopUp__value">65 000</p>
                            </div>
                        </div>
                        <div className="gamePopUp__block">
                            <div className="gamePopUp__row">
                                <p className="gamePopUp__text">Highest mass</p>
                                <p className="gamePopUp__value">4 mln</p>
                            </div>
                            <div className="gamePopUp__row">
                                <p className="gamePopUp__text">Leaderboard position</p>
                                <p className="gamePopUp__value">12</p>
                            </div>
                            <div className="gamePopUp__row">
                                <p className="gamePopUp__text">Top position</p>
                                <p className="gamePopUp__value">2344</p>
                            </div>
                        </div>
                    </div>
                    <a className="gamePopUp__btn btn btn--center" href="">PLAY 1 TEZ</a>
                    <a className="gamePopUp__share" href="" >Invite friends</a>

                    <div className="gamePopUp__bg">
                        <Image src='/img/bg-game-pop-up-win.png' layout='fill' /> {/* if lose change image }
                        {/* <Image src='/img/bg-game-pop-up-lose.png' layout='fill' /> }
                    </div>
                </div>
            </div> */}

            <div className='hud-wrapper'>
                <header className='header header--hud container'>
                    <div className='ingame-leaderboard-wrapper'>
                        <InGameLeaderboard />
                    </div>

                    <div>
                        <div className='header__mass mass'>2.560 * 1022 kg</div>
                    </div>

                    <div className='linkBlock-wrapper'>
                        <div className='header__linkBlock'>
                            <Image
                                className='header__icon'
                                src='/img/icon-home.png'
                                layout='fixed'
                                width={43}
                                height={34}
                                alt=''
                            />
                            <Link href='/dashboard'>
                                <a className='header__link'>Home</a>
                            </Link>
                        </div>
                    </div>
                </header>

                {shouldRenderMain && (
                    <main
                        className='hud'
                        dangerouslySetInnerHTML={renderInner(serverUrl)}></main>
                )}

                <footer>
                    <GameProgressTimer
                        blocksRemaining={
                            Number(endBlock) - Number(currentBlock) >= 0
                                ? Number(endBlock) - Number(currentBlock)
                                : null
                        }
                    />
                </footer>
            </div>
        </>
    );
};

export default function ProtectedHud() {
    const { serverUrl } = useServerContext();
    const [walletAddress, setWalletAddress] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useVirusAnimation();

    useEffect(() => {
        const localStorageWalletAddress = localStorage.getItem("tzAddress");
        setWalletAddress(localStorageWalletAddress);
        setIsLoading(false);
    }, []);

    return (
        <>
            <Script
                src='/assets/js/quadtree.js'
                strategy='beforeInteractive'>
            </Script>
            <Script
                src='/assets/js/main_out.js'
                strategy='afterInteractive'>
            </Script>
            <RouteGuard
                isAllowed={serverUrl && walletAddress}
                redirectUrl="/dashboard"
                isLoading={isLoading}
            >
                <Hud />
            </RouteGuard>
        </>
    );
}
