import { useEffect, useState } from "react";

const useLoading = (minLoadingTime = 750) => {
    const [isLoading, setIsLoading] = useState(false);
    const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);

    const [loadingEnded, setLoadingEnded] = useState(null);

    // Setting Timeout for minimum loading time
    useEffect(() => {
        setIsLoading(true);

        const loadingTimeout = setTimeout(() => {
            setMinimumTimeElapsed(true);
        }, minLoadingTime);
        return () => {
            clearTimeout(loadingTimeout);
        };
    }, []);

    useEffect(() => {
        if (!minimumTimeElapsed || !loadingEnded) return;

        setIsLoading(false);
    }, [minimumTimeElapsed, loadingEnded]);

    return { isLoading, setLoadingEnded };
};

export default useLoading;
