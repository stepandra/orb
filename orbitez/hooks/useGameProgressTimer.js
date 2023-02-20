import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useServerContext } from '@context/ServerContext';
import {
    BASE_TZKT_API_URL,
    BASE_TZSTATS_API_URL,
    CONTRACT_ADDRESS
} from "../constants";

const PROGRESS_TIMER_LENGTH = 30;

const useGameProgressTimer = (blocksRemaining) => {
    const [gameDuration, setGameDuration] = useState(null); // in blocks
    const [blockDuration, setBlockDuration] = useState(null); // in seconds
    const [
        optimisticGameRemainingPercentage,
        setOptimisticGameRemainingPercentage
    ] = useState(null);

    const { serverName } = useServerContext();

    // Checking if initial data is loaded and valid
    const isDataLoadedAndValid = useMemo(
        () =>
            gameDuration &&
            blockDuration &&
            blocksRemaining !== null &&
            gameDuration >= blocksRemaining,
        [gameDuration, blockDuration, blocksRemaining]
    );

    // Setting optimistic game remaining percentage
    useEffect(() => {
        if (!isDataLoadedAndValid) return;

        let interval;

        // If zero blocks are left for play:
        // - clearing interval
        // - setting the game remaining percentage directly without setInterval
        if (blocksRemaining === 0) {
            clearInterval(interval);
            setOptimisticGameRemainingPercentage(0);
            return;
        };

        // Real game remaining percentage value, based on block updates data
        const realGameRemainingPercentage =
            (blocksRemaining / gameDuration) * 100;

        const percentagePerUpdate = 100 / PROGRESS_TIMER_LENGTH;
        const percentagePerBlock = Number.parseFloat(
            (100 / (PROGRESS_TIMER_LENGTH / gameDuration)).toFixed(2)
        );

        const gameDurationInSeconds = blockDuration * gameDuration;
        const intervalDelay =
            (gameDurationInSeconds / PROGRESS_TIMER_LENGTH) * 1000;

        const handleOptimisticUpdates = () => {
            setOptimisticGameRemainingPercentage((prevOptimisticPercentage) => {
                // Difference between real and optimistic percentages
                const optimisticDiff = Number.parseFloat((realGameRemainingPercentage - prevOptimisticPercentage).toFixed(2));

                // Keeping the same percentage value, when all midpoint ...
                // .. updates per block were done 
                if (optimisticDiff >= percentagePerBlock) {
                    return prevOptimisticPercentage;
                };

                // Returning new optimistic percentage value
                return prevOptimisticPercentage - percentagePerUpdate;
            });
        };

        // Setting on initial block and on block updates
        setOptimisticGameRemainingPercentage(realGameRemainingPercentage);
        interval = setInterval(handleOptimisticUpdates, intervalDelay);

        return () => clearInterval(interval);
    }, [isDataLoadedAndValid, blocksRemaining]);

    // Fetching game duration for current room (in blocks)
    useEffect(() => {
        const controller = new AbortController();

        const fetchGameDuration = async () => {
            try {
                const res = await axios({
                    method: "GET",
                    url: `/contracts/${CONTRACT_ADDRESS}/storage`,
                    baseURL: BASE_TZKT_API_URL,
                    signal: controller.signal
                });
                const durationInBlocks = parseInt(res.data.room[serverName]?.distance);
                setGameDuration(durationInBlocks);
            } catch (error) {
                console.error(error);
            }
        };

        fetchGameDuration();

        return () => controller.abort();
    }, []);

    // Fetching average block duration (in seconds) in current cycle
    useEffect(() => {
        const controller = new AbortController();

        const fetchBlockDuration = async () => {
            try {
                const res = await axios({
                    method: "GET",
                    url: "/protocols/current",
                    baseURL: BASE_TZKT_API_URL,
                    signal: controller.signal
                });
                setBlockDuration(res.data.constants.timeBetweenBlocks);
            } catch (error) {
                console.error(error);
            }
        };

        fetchBlockDuration();

        return () => controller.abort();
    }, []);

    const isReady = useMemo(
        () =>
            optimisticGameRemainingPercentage !== null && isDataLoadedAndValid,
        [optimisticGameRemainingPercentage, isDataLoadedAndValid]
    );

    // If optimistically calculated game remaining percentage is not yet known
    // This is the main value on the basis of which the displayed ...
    // .. GameProgressTimer is calculated
    if (!isReady) {
        return {
            isLoading: true,
            activeTimerPiecesCount: null,
            inactiveTimerPiecesCount: null,
        };
    };

    const activeTimerPiecesCount = Math.round(
        PROGRESS_TIMER_LENGTH * (optimisticGameRemainingPercentage / 100)
    );

    const inactiveTimerPiecesCount =
        PROGRESS_TIMER_LENGTH - activeTimerPiecesCount;

    return {
        isLoading: false,
        activeTimerPiecesCount,
        inactiveTimerPiecesCount
    };
};

export default useGameProgressTimer;
