import axios from "axios";
import { useState, useEffect } from "react";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTezos } from "@hooks/useTezos";
import { CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from "../constants";

import { Header } from "@components/Header/Header";
import { Planet } from "@components/Planet/Planet";
import { PlanetList } from "@components/PlanetList/PlanetList";
import { PlanetDataList } from "@components/PlanetDataList/PlanetDataList";
import { DeploymentModal } from "@components/DeploymentModal";
import { PayMethod } from "@components/PayMethod/PayMethod";

export default function Dashboard() {
    const { connectWallet, disconnectWallet, address, Tezos, balance } =
        useTezos();
    const router = useRouter();
    const [mintHash, setMintHash] = useState("");
    const [planetsAvailable, setPlanetsAvailable] = useState([]);
    const [planetSelected, setPlanetSelected] = useState(0);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [deploymentModalOpen, setDeploymentModalOpen] = useState(false);
    const [selectedServerIndex, setSelectedServerIndex] = useState(undefined);
    const [serverList, setServerList] = useState([]);

    const connectAndReload = () => {
        connectWallet().then(() => {
            router.reload();
        });
    };

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
        const ipfsGateways = [
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
            "gateway.pinata.cloud",
        ];

        const promiseList = [];

        for (let gateway of ipfsGateways) {
            promiseList.push(promisify(gateway));
        }

        const winner = await Promise.race(promiseList);
        localStorage.setItem("ipfs-gateway", winner);
    };

    useEffect(async () => {
        ipfsRace();
        const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
        const storage = await contract.storage();
        const contractServerList = [];
        for (let [key, value] of storage.server.valueMap) {
            contractServerList.push({ ...value, name: key });
        }

        setServerList(contractServerList);
        console.log(contractServerList);
        let ls_server = localStorage.getItem("ORBITEZ_SERVER_URL");
        if (ls_server) {
            for (let i = 0; i < contractServerList.length; i++) {
                if (contractServerList[i].server_url === ls_server) {
                    setSelectedServerIndex(i);
                    break;
                }
            }
        } else {
            setSelectedServerIndex(0);
        }
    }, []);

    setTimeout(async () => {
        let gateway;
        if (typeof window !== "undefined")
            gateway = localStorage.getItem("ipfs-gateway") || "gateway.ipfs.io";
        else {
            gateway = "gateway.ipfs.io";
        }
        !planetsAvailable.length &&
            fetch("https://api.fxhash.xyz/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    query: '{generativeToken(slug: "Orbitoid", id: 3808) {entireCollection {id owner {id} generationHash metadata }}}',
                }),
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
                                token_id: post.id,
                            });
                        }
                    });
                    if (!planets.length) {
                        planets.push({
                            gen_hash:
                                "ooKg2zuJu9XhZBRKQaBrEDvpeYZjDPmKREp3PMSZHLkoSFK3ejN",
                            img_link: `https://${gateway}/ipfs/QmaXjh2fxGMN4LmzmHMWcjF8jFzT7yajhbHn7yBN7miFGi`,
                            token_id: "DEMO PLANET",
                        });
                    }
                    setPlanetsAvailable(planets);
                });
    }, 2000);

    useEffect(() => {
        if (typeof selectedServerIndex == "undefined" || !serverList.length)
            return;
        localStorage.setItem(
            "ORBITEZ_SERVER_URL",
            serverList[selectedServerIndex].server_url
        );
        localStorage.setItem(
            "ORBITEZ_SERVER_NAME",
            serverList[selectedServerIndex].name
        );
    }, [selectedServerIndex]);

    useEffect(() => {
        if (planetsAvailable?.[planetSelected]) {
            const selected = planetsAvailable[planetSelected];
            if (selected.token_id === "DEMO PLANET") {
                setIsDemoMode(true);
            } else {
                setIsDemoMode(false);
            }
            setMintHash(selected.gen_hash);
            localStorage.setItem("mintHash", selected.gen_hash);
            localStorage.setItem("skinLink", selected.img_link);
        }
    }, [planetSelected, planetsAvailable]);

    const enterRoom = async () => {
        const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);

        try {
            const serverNameSanitized = serverList[
                selectedServerIndex
            ]?.name.replaceAll('"', "");
            console.log(serverNameSanitized, serverList);
            await contract.methods
                .enter_room(serverNameSanitized, serverNameSanitized)
                .send({ amount: 1 });
            router.push("/waiting-room");
        } catch (e) {
            console.log("Transaction rejected:", e);
        }
    };

    const demoHud = async () => {
        router.push("/hud?endless=true");
    };

    const mintOnFx = async () => {
        const contract = await Tezos.wallet.at(NFT_CONTRACT_ADDRESS);
        try {
            await contract.methods
                .mint("tz1iJJPGh7arygfq5EC2sBaAF23T8iUYTpEH", 3808)
                .send({ amount: 1 });

            // router.push('/waiting-room')
        } catch (e) {
            console.log("Transaction rejected:", e);
        }
    };

    const openDeploymentModal = async () => {
        if (!address) connectWallet();
        setDeploymentModalOpen(true);
    };

    return (
        <>
            <Head>
                <title>Dashboard - Orbitez.io</title>
            </Head>

            <Header />

            <main className='dashboard container'>
                <div className='dashboard__left'>
                    <PlanetList
                        planetsAvailable={planetsAvailable}
                        setPlanetSelected={setPlanetSelected}
                        planetSelected={planetSelected}
                    />
                </div>

                <div className='dashboard__center'>
                    <img src='/img/bg-planet.png' className='planet_outline' />
                    <Planet mintHash={mintHash} />
                    <PayMethod />
                </div>

                <div className='dashboard__right'>
                    <PlanetDataList mintHash={mintHash} />
                </div>

                <a
                    className='btn btn--center btn--wide'
                    onClick={() =>
                        window.open(
                            "https://www.fxhash.xyz/marketplace/generative/3808",
                            "_blank"
                        )
                    }>
                    <span className='btn__iconPlus'></span> MINT NEW PLANET
                </a>

                <a
                    className=' btn btn--center'
                    onClick={() => {
                        address == "" ? connectAndReload() : enterRoom();
                    }}>
                    {address == "" ? "Connect wallet" : "PLAY"}
                </a>

                <a
                    className='btn btn--center btn--wide'
                    onClick={() => {
                        openDeploymentModal();
                    }}>
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
