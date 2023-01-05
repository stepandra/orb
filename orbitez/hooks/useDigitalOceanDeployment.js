import { useState, useEffect, useCallback, useRef } from "react";
import { useTezos } from "./useTezos";
import axios from "axios";
import { CONTRACT_ADDRESS } from "../constants";
import useLoading from "./useLoading";

const useDigitalOceanDeployment = (regionsList) => {
    const [deployTezos, setDeployTezos] = useState(
        localStorage.getItem("DEPLOY_TEZ_NODE") == "true"
    );

    const [token, setToken] = useState(localStorage.getItem("DO_TOKEN") ?? "");
    const [progress, setProgress] = useState(0);
    const [baseUrl, setBaseUrl] = useState(null);
    const [tezNodeReady, setTezNodeReady] = useState(false);
    const [serverName, setServerName] = useState("");
    const [regionIndex, setRegionIndex] = useState(0);
    const [roomSize, setRoomSize] = useState(undefined);
    const [gameLength, setGameLength] = useState(undefined);

    const [shouldPoll, setShouldPoll] = useState(false);
    const pollingInterval = useRef(null);

    const { Tezos, address } = useTezos();

    // Setting minimum loading time
    const { isLoading, setLoadingEnded } = useLoading(750);

    const getDroplets = useCallback(async () => {
        const DO_TOKEN = localStorage.getItem("DO_TOKEN");
        if (DO_TOKEN !== "") {
            const res = await axios.post("/api/get_do_droplets", {
                token: DO_TOKEN
            });
            setLoadingEnded(true);
            const { droplets } = res.data;
            if (!droplets || !droplets.length) return;
            const orbDroplet = droplets[0].dropletInfo;
            const tags = orbDroplet.tags;
            tags.push(orbDroplet.status);

            if (
                (tags.includes("kv:ssl-ready:true") && !deployTezos) ||
                (tags.includes("kv:tez-node-ready:true") && deployTezos)
            ) {
                setShouldPoll(false);
            } else {
                setShouldPoll(true);
            }

            if (tags.includes("kv:tez-node-ready:true")) {
                setTezNodeReady(true);
            }

            for (let tag of tags) {
                if (tag.includes("room-name")) {
                    const roomRegExp = /(kv:room-name:)(.+)/;
                    const roomMatch = tag.match(roomRegExp);
                    if (roomMatch?.[2]) {
                        setServerName(roomMatch[2]);
                    }
                }
                if (tag.includes("assigned-subdomain")) {
                    const subdomainRegExp = /(kv:assigned-subdomain:)(.+)/;
                    const subdomainMatch = tag.match(subdomainRegExp);
                    if (subdomainMatch?.[2]) {
                        setBaseUrl(`${subdomainMatch[2]}.orbitez.io`);
                    }
                }
            }

            setProgressBarFromTags(tags);
        }
    }, []);

    // Running on mount and when token gets available
    useEffect(() => {
        if (!token) return;

        getDroplets();
    }, [token]);

    // On shouldPoll updates
    useEffect(() => {
        // On shouldPoll = false
        if (!shouldPoll && pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }

        // On shouldPoll = true
        if (shouldPoll) {
            pollingInterval.current = setInterval(getDroplets, 15000);
        }

        // Cleaning up interval on unmount
        return () => clearInterval(pollingInterval.current);
    }, [shouldPoll]);

    const deployDOServer = useCallback(async () => {
        await axios.post("/api/deploy_orbitez_do", {
            token,
            deployTezos,
            region: regionsList[regionIndex].value.toLowerCase(),
            contractAddress: CONTRACT_ADDRESS,
            roomName: serverName,
        });
        setProgress(5);
        setShouldPoll(true);
    }, [token, deployTezos, regionsList, regionIndex, serverName]);

    useEffect(() => {
        localStorage.setItem("DO_TOKEN", token);
    }, [token]);

    const setProgressBarFromTags = useCallback((tags) => {
            let newProgress = 5;
            if (tags.includes("new")) {
                newProgress = 9;
            }
            if (tags.includes("active")) {
                newProgress = 15;
            }
            if (tags.includes("kv:install-started:true")) {
                newProgress = deployTezos ? 20 : 30;
            }
            if (tags.includes("kv:docker-container-started:true")) {
                newProgress = deployTezos ? 35 : 50;
            }
            if (tags.includes("kv:nginx-ready:true")) {
                newProgress = deployTezos ? 45 : 60;
            }
            if (tags.includes("kv:dns-records-available:true")) {
                newProgress = deployTezos ? 60 : 80;
            }
            if (tags.includes("kv:ssl-ready:true")) {
                newProgress = deployTezos ? 75 : 100;
            }
            if (tags.includes("kv:tez-node-install-started:true")) {
                newProgress = 85;
            }
            if (tags.includes("kv:tez-node-ready:true")) {
                newProgress = 100;
            }
            if (progress !== newProgress) setProgress(newProgress);
        },
        [progress, deployTezos]
    );

    const activateServer = useCallback(async () => {
        const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
        const serverUrl = `server.${baseUrl}`;
        try {
            await contract.methods
                .create_server(
                    serverName,
                    address,
                    serverName,
                    serverUrl,
                    1000000,
                    roomSize,
                    gameLength
                )
                .send({ storageLimit: 1000 });
        } catch (e) {
            console.log("Transaction rejected:", e);
        }
    }, [Tezos, serverName, address, serverName, baseUrl, roomSize, gameLength]);

    const getTezRpcUrl = useCallback(() => {
        if (!baseUrl || !tezNodeReady) return null;

        return `rpc.${baseUrl}`;

    }, [baseUrl, tezNodeReady])

    const tezRpcUrl = getTezRpcUrl();

    return {
        isLoading,
        deployTezos,
        setDeployTezos,
        token,
        setToken,
        progress,
        tezRpcUrl,
        serverName,
        setServerName,
        regionIndex,
        setRegionIndex,
        roomSize,
        setRoomSize,
        gameLength,
        setGameLength,
        deployDOServer,
        activateServer,
    };
};

export default useDigitalOceanDeployment;
