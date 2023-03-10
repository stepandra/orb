import { useState, useEffect, useCallback } from "react";
import { useTezos } from "@hooks/useTezos";
import { BigNumber } from "bignumber.js";
import {
    CONTRACT_ADDRESS,
    SHOULD_USE_DEV_SERVER,
    DEV_SERVER
} from "../constants";
import { useServerContext } from '@context/ServerContext';

const useContractServers = () => {
    const [contractServers, setContractServers] = useState([]);
    const [selectedServerIndex, setSelectedServerIndex] = useState(null);

    const { Tezos } = useTezos();

    const {
        serverUrl: savedServerUrl,
        setServerName,
        setServerUrl,
        setStatsUrl
    } = useServerContext();

    const calculateServerState = useCallback((serverData) => {
        const {
            name: serverName,
            rooms: serverRooms,
            players: serverPlayers
        } = serverData;
        const mainRoom = serverRooms.get(serverName);

        // Checking if the server is full
        let isFull = false;

        const maxPlayers = mainRoom.size.toNumber();
        const currentNumberOfPlayers = serverPlayers.length;

        if (maxPlayers === currentNumberOfPlayers) {
            isFull = true;
        }

        // Checking if the game is currently running
        let isGameRunning = false;

        const isFinishBlockPresent = !mainRoom.finish_block.isZero();

        if (isFinishBlockPresent) {
            isGameRunning = true;
        }

        return {
            isFull,
            isGameRunning
        };
    }, []);

    useEffect(() => {
        const fetchServerList = async () => {
            const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
            const storage = await contract.storage();

            const serverMap = storage.server.valueMap;
            const roomMap = storage.room.valueMap;

            let contractServerList = [];
            for (let [serverName, serverData] of serverMap) {
                const serverRoomNames = serverData.rooms;
                const roomMapOfServer = new Map();
                serverRoomNames.forEach((roomName) => {
                    const key = `\"${roomName}\"`;
                    roomMapOfServer.set(key, roomMap.get(key));
                });
                const formattedServerData = {
                    ...serverData,
                    rooms: roomMapOfServer,
                    name: serverName
                };
                const { isFull, isGameRunning } =
                    calculateServerState(formattedServerData);
                contractServerList.push({
                    ...formattedServerData,
                    isFull,
                    isGameRunning
                });
            }

            setContractServers(contractServerList);

            if (!savedServerUrl) {
                setSelectedServerIndex(0);
                return;
            }

            const savedServerIndex = contractServerList.findIndex(
                (contractServer) => {
                    contractServer.server_url === savedServerUrl;
                }
            );

            if (savedServerIndex === -1) {
                setSelectedServerIndex(0);
                return;
            }

            setSelectedServerIndex(savedServerIndex);
        };

        if (SHOULD_USE_DEV_SERVER) {
            setContractServers([DEV_SERVER.data]);
            setSelectedServerIndex(0);
            sessionStorage.setItem("SHOULD_USE_DEV_SERVER", "true");
            return;
        };

        fetchServerList();
    }, []);

    // Setting selected server to context & localStorage
    useEffect(() => {
        if (selectedServerIndex == null || !contractServers.length) return;

        const selectedServerUrl =
            contractServers[selectedServerIndex].server_url;
        const selectedServerName = contractServers[selectedServerIndex].name;
        const sanitizedSelectedServerName = selectedServerName.replaceAll('"', "");
        const baseServerUrl = selectedServerUrl.match(/^(?:server.)(.*)/)?.[1];
        const selectedServerStatsUrl = SHOULD_USE_DEV_SERVER
            ? DEV_SERVER.statsServerUrl
            : `stats.${baseServerUrl}`;

        setServerName(sanitizedSelectedServerName);
        setServerUrl(selectedServerUrl);
        setStatsUrl(selectedServerStatsUrl);
    }, [contractServers, selectedServerIndex]);

    // Setting env variable SHOULD_USE_DEV_SERVER for access from public/main_out.js file
    useEffect(() => {
        localStorage.setItem("SHOULD_USE_DEV_SERVER", SHOULD_USE_DEV_SERVER);
    }, []);

    return {
        contractServers,
        selectedServerIndex
    }
};

export default useContractServers;
