import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";

import Head from "next/head";
import { useRouter } from "next/router";
import { useTezos } from "@hooks/useTezos";
import usePlanet from "@hooks/usePlanet";
import { CONTRACT_ADDRESS, SHOULD_USE_DEV_SERVER } from "../constants";

import { Header } from "@components/Header/Header";
import { Planet } from "@components/Planet/Planet";
import { PlanetList } from "@components/PlanetList/PlanetList";
import { PlanetDataList } from "@components/PlanetDataList/PlanetDataList";
import { DeploymentModal } from "@components/DeploymentModal/DeploymentModal";
import { PayMethod } from "@components/PayMethod/PayMethod";
import { PlanetScripts } from "@components/PlanetScripts/PlanetScripts";
import useContractServers from "@hooks/useContractServers";

const DEFAULT_GATEWAY = "gateway.ipfs.io";

const IPFS_GATEWAYS = [
    "gateway.ipfs.io",
    "ipfs.io",
    "infura-ipfs.io",
    "cloudflare-ipfs.com",
    "dweb.link",
    "ipfs.fleek.co",
    "ipfs.lain.la",
    "nftstorage.link",
    "ipfs.infura.io",
    "ipfs.telos.miami",
    "ipfs.eth.aragon.network",
    "via0.com",
    "gateway.pinata.cloud"
];

export default function Dashboard() {
    const { connectWallet, address, Tezos, isAuthLoaded } = useTezos();
    const router = useRouter();
    const [mintHash, setMintHash] = useState("");
    const [planetsAvailable, setPlanetsAvailable] = useState([]);
    const [planetSelected, setPlanetSelected] = useState(0);
    const [deploymentModalOpen, setDeploymentModalOpen] = useState(false);

    const { contractServers, selectedServerIndex } = useContractServers();

    // const [isDemoMode, setIsDemoMode] = useState(false);

    const { isPlanetInitialized, setArePlanetScriptsReady } =
        usePlanet(mintHash);

    useEffect(() => {
        const promisify = (gateway) => {
            return new Promise((resolve, reject) => {
                try {
                    axios
                        .get(
                            `https://${gateway}/ipfs/QmaXjh2fxGMN4LmzmHMWcjF8jFzT7yajhbHn7yBN7miFGi`
                        )
                        .then((res) => {
                            console.log(res.status);
                            resolve(gateway);
                        })
                        .catch((e) => {
                            console.log(e);
                        });
                } catch (e) {
                    reject();
                }
            });
        };

        const ipfsRace = async () => {
            const promiseList = [];
    
            for (let gateway of IPFS_GATEWAYS) {
                promiseList.push(promisify(gateway));
            }
    
            const winner = await Promise.race(promiseList);
            localStorage.setItem("ipfs-gateway", winner);
        };
        
        ipfsRace();
    }, []);

    const getGateway = useCallback(() => {
        if (typeof window === "undefined") {
            return DEFAULT_GATEWAY;
        }

        const localStorageGateway = localStorage.getItem("ipfs-gateway");

        if (!localStorageGateway) {
            return DEFAULT_GATEWAY;
        }

        return localStorageGateway;
    }, []);

    const getDemoPlanet = useCallback((gateway) => {
        return {
            gen_hash: "ooKg2zuJu9XhZBRKQaBrEDvpeYZjDPmKREp3PMSZHLkoSFK3ejN",
            img_link: `https://${gateway}/ipfs/QmaXjh2fxGMN4LmzmHMWcjF8jFzT7yajhbHn7yBN7miFGi`,
            token_id: "DEMO PLANET"
        };
    }, []);

    useEffect(() => {
        if (!isAuthLoaded) return;

        if (!address) {
            const gateway = getGateway();
            const demoPlanet = getDemoPlanet(gateway);

            setPlanetsAvailable([demoPlanet]);
            return;
        }

        const fetchPlanets = async () => {
            const gateway = getGateway();

            fetch("https://api.fxhash.xyz/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    query: '{generativeToken(slug: "Orbitoid", id: 3808) {entireCollection {id owner {id} generationHash metadata }}}'
                })
            })
                .then((res) => res.json())
                .then((res) => {
                    const owners_ids =
                        res.data?.generativeToken?.entireCollection;
                    const planets = [];
                    owners_ids.map((post) => {
                        if (post.owner.id == address) {
                            planets.push({
                                img_link:
                                    `https://${gateway}/ipfs` +
                                    post.metadata.displayUri.slice(6),
                                gen_hash: post.metadata.iterationHash,
                                token_id: post.id
                            });
                        }
                    });
                    if (!planets.length) {
                        const demoPlanet = getDemoPlanet(gateway);
                        planets.push(demoPlanet);
                    }
                    setPlanetsAvailable(planets);
                });
        };

        fetchPlanets();
    }, [isAuthLoaded, address]);

    useEffect(() => {
        if (planetsAvailable.length === 0) return;

        const selected = planetsAvailable[planetSelected];

        // if (selected.token_id === "DEMO PLANET") {
        //     setIsDemoMode(true);
        // } else {
        //     setIsDemoMode(false);
        // }

        setMintHash(selected.gen_hash);
        localStorage.setItem("mintHash", selected.gen_hash);
        localStorage.setItem("skinLink", selected.img_link);
    }, [planetSelected, planetsAvailable]);

    const connectAndReload = useCallback(() => {
        connectWallet().then(() => {
            router.reload();
        });
    }, [connectWallet, router]);

    const enterRoom = useCallback(async () => {
        const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);

        try {
            const serverNameSanitized = contractServers[
                selectedServerIndex
            ]?.name.replaceAll('"', "");
            console.log(serverNameSanitized, contractServers);
            await contract.methods
                .enter_room(serverNameSanitized, serverNameSanitized)
                .send({ amount: 1 });
            router.push("/waiting-room");
        } catch (e) {
            console.log("Transaction rejected:", e);
        }
    }, [Tezos, contractServers, selectedServerIndex]);

    const joinDevServer = useCallback(() => {
        router.push("/hud");
    }, []);

    const openDeploymentModal = useCallback(async () => {
        if (!isAuthLoaded) return;

        if (!address) await connectWallet();
        setDeploymentModalOpen(true);
    }, [isAuthLoaded, address]);

    // const demoHud = async () => {
    //     router.push("/hud?endless=true");
    // };

    // const mintOnFx = async () => {
    //     const contract = await Tezos.wallet.at(NFT_CONTRACT_ADDRESS);
    //     try {
    //         await contract.methods
    //             .mint("tz1iJJPGh7arygfq5EC2sBaAF23T8iUYTpEH", 3808)
    //             .send({ amount: 1 });

    //         // router.push('/waiting-room')
    //     } catch (e) {
    //         console.log("Transaction rejected:", e);
    //     }
    // };

    return (
        <>
            <Head>
                <title>Dashboard - Orbitez.io</title>
            </Head>
            <PlanetScripts
                onScriptsReady={() => setArePlanetScriptsReady(true)}
            />

            <Header />

            <main className="dashboard container">
                <div className="dashboard__left">
                    <PlanetList
                        planetsAvailable={planetsAvailable}
                        setPlanetSelected={setPlanetSelected}
                        planetSelected={planetSelected}
                    />
                </div>

                <div className="dashboard__center">
                    <img src="/img/bg-planet.png" className="planet_outline" />
                    <Planet isPlanetReady={isPlanetInitialized} />
                    <PayMethod />
                </div>

                <div className="dashboard__right">
                    <PlanetDataList
                        isPlanetReady={isPlanetInitialized}
                        mintHash={mintHash}
                    />
                </div>

                <a
                    className="btn btn--center btn--wide"
                    onClick={() =>
                        window.open(
                            "https://www.fxhash.xyz/marketplace/generative/3808",
                            "_blank"
                        )
                    }
                >
                    <span className="btn__iconPlus"></span> MINT NEW PLANET
                </a>

                <a
                    className="btn btn--center"
                    onClick={address == "" ? connectAndReload : SHOULD_USE_DEV_SERVER ? joinDevServer : enterRoom}

                >
                    {address == "" ? "Connect wallet" : "PLAY"}
                </a>

                <a
                    className="btn btn--center btn--wide"
                    onClick={openDeploymentModal}
                >
                    <span>Deploy Server</span>
                </a>
                {/* 
                <a className="" onClick={() => demoHud()}>
                    { address == '' ? "DEMO GAMEPLAY" : "Endless room" }
                </a> */}

                {/* <div className="listBlock">
                    <h2 className="listBlock__title">Deployments</h2>
                    <div className="">
                       
                    </div>
                </div>
                <div className="payMethod" style={{ cursor: 'default' }}>
                    <h3 className="payMethod__title">Select server</h3>
                    <div className="payMethod__switcher">
                        <img className="payMethod__prev" style={{ cursor: 'pointer' }} src='/img/icon-prev.png' onClick={() => selectedServerIndex > 0 && setSelectedServerIndex(selectedServerIndex - 1)}></img>
                        <p className="payMethod__item">{serverList[selectedServerIndex]?.name}</p>
                        <img className="payMethod__next" style={{ cursor: 'pointer' }} src='/img/icon-prev.png' onClick={() => selectedServerIndex < serverList.length - 1 && setSelectedServerIndex(selectedServerIndex + 1)}></img>
                    </div>
                </div> */}
            </main>

            {/* <div className="overlays">
                <div className="popUp">

                    <h2 className="popUp__title">WAITING FOR PLAYERS</h2>
                    <div className="popUp__progressBar">
                        <div className="popUp__barItem popUp__barItem--active"></div>
                        <div className="popUp__barItem popUp__barItem--active"></div>
                        <div className="popUp__barItem popUp__barItem--active"></div>
                        <div className="popUp__barItem popUp__barItem--active"></div>
                        <div className="popUp__barItem popUp__barItem--active"></div>
                        <div className="popUp__barItem popUp__barItem--active"></div>
                        <div className="popUp__barItem popUp__barItem--active"></div>
                        <div className="popUp__barItem"></div>
                        <div className="popUp__barItem"></div>
                        <div className="popUp__barItem"></div> 
                    </div>
                    <div className="popUp__countPlayers">7 / 10</div>
                    <div className="popUp__players">
                        <p className="popUp__playerName">Marsofuel S5</p>
                        <p className="popUp__playerName">Orbitez NN</p>
                        <p className="popUp__playerName">Agraried</p>
                        <p className="popUp__playerName">SilverSpoon</p>
                        <p className="popUp__playerName">Orbitez NN</p>
                        <p className="popUp__playerName">Agraried</p>
                        <p className="popUp__playerName">SilverSpoon</p>
                        <p className="popUp__playerName">Marsofuel S5</p>
                        <p className="popUp__playerName">Orbitez NN</p>
                        <p className="popUp__playerName">Agraried</p>
                        <p className="popUp__playerName">SilverSpoon</p>
                        <p className="popUp__playerName">Orbitez NN</p>
                        <p className="popUp__playerName">Agraried</p>
                        <p className="popUp__playerName">SilverSpoon</p>
                    </div>
                    <a className="popUp__btn btn btn--center">START</a>

                    <div className="popUp__leaveBlock leaveBlock">
                        <p className="leaveBlock__time">14 sec</p>
                        <div className="leaveBlock__closeWrap">
                            <div className="leaveBlock__closeBtn"></div>
                        </div>
                        <p className="leaveBlock__text"><b>
                            LEAVE</b> <br />(NO FEE)
                        </p>
                    </div>
                </div>
            </div> */}

            {deploymentModalOpen && (
                <DeploymentModal
                    closeModal={() => setDeploymentModalOpen(false)}
                />
            )}
        </>
    );
}
