import React, { useEffect, useState } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import { useTezos } from "../hooks/useTezos";
import axios from "axios";
import { CONTRACT_ADDRESS } from "../constants";

const regionsList = [
    { name: "New York City", value: "NYC3" },
    { name: "San Francisco", value: "SFO3" },
    { name: "Toronto, Canada", value: "TOR1" },
    { name: "London, United Kingdom", value: "LON1" },
    { name: "Frankfurt, Germany", value: "FRA1" },
    { name: "Amsterdam, the Netherlands", value: "AMS3" },
    { name: "Singapore", value: "SGP1" },
    { name: "Bangalore, India", value: "BLR1" },
];

export function DigitalOceanDeployment() {
    const [deployTezos, setDeployTezos] = useState(
        localStorage.getItem("DEPLOY_TEZ_NODE") == "true"
    );

    const [token, setToken] = useState(localStorage.getItem("DO_TOKEN"));
    const [progress, setProgress] = useState(0);
    const [animatedText, setAnimatedText] = useState("Deploying");
    const [orbitezNgrokUrl, setOrbitezNgrokUrl] = useState("");
    const [rpcNgrokUrl, setRpcNgrokUrl] = useState("");
    const [serverName, setServerName] = useState("");
    const [regionIndex, setRegionIndex] = useState(0);
    const [roomSize, setRoomSize] = useState(undefined);
    const [gameLength, setGameLength] = useState(undefined);

    const { Tezos, address } = useTezos();

    const getDroplets = async () => {
        const DO_TOKEN = localStorage.getItem("DO_TOKEN");
        if (DO_TOKEN !== "") {
            const res = await axios.post("/api/get_do_droplets", {
                token: DO_TOKEN,
            });
            const { droplets } = res.data;
            if (!droplets || !droplets.length) return;
            const orbDroplet = droplets[0].dropletInfo;
            const tags = orbDroplet.tags;
            tags.push(orbDroplet.status);

            for (let tag of tags) {
                if (tag.includes("NGROK_URL")) {
                    const ngrk_rgx = /(?<=kv:NGROK_URL:).*/;
                    const ngrk_match = tag.match(ngrk_rgx);
                    if (ngrk_match.length) {
                        setOrbitezNgrokUrl(`${ngrk_match[0]}.ngrok.io`);
                    }
                }
                if (tag.includes("TEZ_RPC_URL")) {
                    const rpc_rgx = /(?<=kv:TEZ_RPC_URL:).*/;
                    const rpc_match = tag.match(rpc_rgx);
                    if (rpc_match.length) {
                        setRpcNgrokUrl(rpc_match[0]);
                    }
                }
            }

            setProgressBarFromTags(tags);
        }
    };

    const pollStatus = () => {
        getDroplets();

        setTimeout(() => {
            pollStatus();
        }, 15000);
    };

    useEffect(() => {
        updateText();
        pollStatus();
    }, []);

    const deployDOServer = async () => {
        await axios.post("/api/deploy_orbitez_do", {
            token,
            deployTezos,
            region: regionsList[regionIndex].value.toLowerCase(),
            contractAddress: CONTRACT_ADDRESS,
            roomName: localStorage.getItem("ORBITEZ_SERVER_NAME"),
        });
        setProgress(5);
    };

    const updateText = (n = 1) => {
        let dotCount = n;
        if (n > 3) {
            dotCount = 1;
        }
        setTimeout(() => {
            setAnimatedText("Deploying" + ".".repeat(dotCount));
            updateText(dotCount + 1);
        }, 500);
    };

    useEffect(() => {
        localStorage.setItem("DO_TOKEN", token);
    }, [token]);

    const setProgressBarFromTags = (tags) => {
        let newProgress = 5;
        if (tags.includes("new")) {
            newProgress = 9;
        }
        if (tags.includes("active")) {
            newProgress = 15;
        }
        if (tags.includes("kv:install-started:true")) {
            newProgress = deployTezos ? 30 : 60;
        }
        if (tags.includes("kv:ngrok_ready:true")) {
            newProgress = deployTezos ? 35 : 100;
        }
        if (tags.includes("kv:node_install_started:true")) {
            newProgress = 85;
        }
        if (tags.includes("kv:node_live:true")) {
            newProgress = 100;
        }
        if (progress !== newProgress) setProgress(newProgress);
    };

    const activateServer = async () => {
        const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
        try {
            await contract.methods
                .create_server(
                    serverName,
                    address,
                    serverName,
                    orbitezNgrokUrl,
                    1000000,
                    roomSize,
                    gameLength
                )
                .send({ storageLimit: 1000 });
        } catch (e) {
            console.log("Transaction rejected:", e);
        }
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "50%",
                }}>
                <img
                    width={progress === 100 ? 0 : 100}
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/DigitalOcean_logo.svg/1200px-DigitalOcean_logo.svg.png'
                />
                {progress == 0 && (
                    <div
                        className=''
                        style={{
                            cursor: "default",
                            marginTop: 0,
                            marginBottom: "1rem",
                        }}>
                        <h3
                            className='payMethod__title'
                            style={{ textAlign: "center" }}>
                            Select region
                        </h3>
                        <div
                            className='payMethod__switcher'
                            style={{ display: "flex", flexDirection: "row" }}>
                            <a
                                className=''
                                style={{ cursor: "pointer", margin: "1rem" }}
                                onClick={() =>
                                    regionIndex > 0 &&
                                    setRegionIndex(regionIndex - 1)
                                }>
                                ←
                            </a>
                            <p
                                className='payMethod__item'
                                style={{ margin: "1rem" }}>
                                {regionsList[regionIndex].name}
                            </p>
                            <a
                                className=''
                                style={{ cursor: "pointer", margin: "1rem" }}
                                onClick={() =>
                                    regionIndex < regionsList.length - 1 &&
                                    setRegionIndex(regionIndex + 1)
                                }>
                                →
                            </a>
                        </div>
                    </div>
                )}
                {progress != 0 && progress !== 100 && (
                    <>
                        <div style={{ width: "80%" }}>
                            <ProgressBar completed={progress} />
                        </div>
                    </>
                )}
                {progress == 0 && (
                    <>
                        <input
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            style={{ width: "65%" }}
                            placeholder='Paste your DigitalOcean read/write token here'
                        />
                        <div
                            style={{
                                display: "flex",
                                width: "100%",
                                justifyContent: "center",
                                marginTop: "1rem",
                            }}
                            onClick={(e) => {
                                setDeployTezos(!deployTezos);
                                localStorage.setItem(
                                    "DEPLOY_TEZ_NODE",
                                    deployTezos ? "false" : "true"
                                );
                            }}>
                            <input
                                style={{ width: 35, marginTop: 5 }}
                                type={"checkbox"}
                                checked={deployTezos}
                            />
                            <h3>Deploy Tezos node</h3>
                        </div>
                    </>
                )}
                {progress !== 100 && deployTezos == true && (
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: 12,
                            padding: 10,
                        }}>
                        The deployment of new Orbitez server and Tezos node
                        takes about 90 min.
                    </p>
                )}
                {progress !== 100 && deployTezos == false && (
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: 12,
                            padding: 10,
                        }}>
                        The deployment of a new Orbitez server will take roughly
                        15 min.
                    </p>
                )}
                {progress !== 100 && (
                    <button
                        className='planet__btn btn btn--center'
                        style={{
                            margin: 10,
                            fontSize: 18,
                            padding: 0,
                            minHeight: 45,
                            cursor: progress != 0 ? "progress" : "pointer",
                            cursor: token == "" ? "no-drop" : "pointer",
                        }}
                        disabled={progress != 0 || token == ""}
                        onClick={() => {
                            deployDOServer();
                        }}>
                        <span>
                            {progress == 0 ? "Deploy Server" : animatedText}
                        </span>
                    </button>
                )}
                {progress === 100 && deployTezos && (
                    <>
                        <p style={{ width: "85%" }}>
                            Your own Tezos Node is live. Add the following RPC
                            to your wallet:
                            <br />
                            <br /> https://{rpcNgrokUrl}.ngrok.io
                        </p>
                        <br />
                    </>
                )}
                {progress == 100 && (
                    <>
                        <p style={{ width: "85%" }}>
                            Your game server is ready! Hit activate button to
                            start receiving rewards for every game hosted on
                            your server.
                            <br />
                            <br />
                        </p>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}>
                            <input
                                style={{ height: 50, width: "40%", margin: 0 }}
                                placeholder='Server Name*'
                                type={"text"}
                                value={serverName}
                                onChange={(e) => setServerName(e.target.value)}
                            />
                            <input
                                style={{ height: 50, width: "40%", margin: 0 }}
                                placeholder='Room Size (3+)'
                                type={"number"}
                                value={roomSize}
                                onChange={(e) => setRoomSize(e.target.value)}
                            />
                            <input
                                style={{ height: 50, width: "40%", margin: 0 }}
                                placeholder='Game Length (5+)'
                                type={"number"}
                                value={gameLength}
                                onChange={(e) => setGameLength(e.target.value)}
                            />
                            <button
                                style={{
                                    margin: "0.5rem",
                                    fontSize: 14,
                                    minHeight: 0,
                                    height: 50,
                                    cursor:
                                        serverName == "" ||
                                        roomSize < 3 ||
                                        gameLength < 5
                                            ? "no-drop"
                                            : "pointer",
                                }}
                                className='planet__btn btn btn--center'
                                disabled={
                                    serverName == "" ||
                                    roomSize < 3 ||
                                    gameLength < 5
                                }
                                onClick={() => {
                                    activateServer();
                                }}>
                                Activate
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
