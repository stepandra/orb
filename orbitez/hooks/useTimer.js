import { useState, useEffect, useRef, useCallback } from 'react';

const useTimer = ({ cancelOnUnmount = true }) => {
    const [ remainingSeconds, setRemainingSeconds] = useState(null);

    const mainTimeout = useRef(null);
    const countingSecondsInterval = useRef(null);

    useEffect(() => {
        if (!cancelOnUnmount) return;

        return () => {
            clearTimeout(mainTimeout);
            clearInterval(countingSecondsInterval);
        };
    }, []);

    const countAndSetSeconds = useCallback((endTime) => {
        const currentTime = performance.now();

        const remainingTimeRoundedToSec = Math.round((endTime - currentTime) / 1000);

        if (remainingTimeRoundedToSec <= 0) return;

        setRemainingSeconds(remainingTimeRoundedToSec);
    }, [setRemainingSeconds]);

    const setTimer = useCallback((functionToCall, delay) => {
        const endTime = performance.now() + delay;

        setRemainingSeconds(delay / 1000);

        mainTimeout.current = setTimeout(() => {
            clearInterval(countingSecondsInterval);

            functionToCall();
        }, delay);

        countingSecondsInterval.current = setInterval(() => {
            countAndSetSeconds(endTime);
        }, 1000);

        return () => clearTimeout(mainTimeout);
    }, [countingSecondsInterval, countAndSetSeconds]);

    return { setTimer, remainingSeconds };
};

export default useTimer;
