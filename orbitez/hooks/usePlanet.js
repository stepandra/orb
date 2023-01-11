import { useState, useEffect } from "react";

const usePlanet = (mintHash) => {
    const [arePlanetScriptsReady, setArePlanetScriptsReady] = useState(false);
    const [isPlanetInitialized, setIsPlanetInitialized] = useState(false);

    useEffect(() => {
        if (!mintHash || !arePlanetScriptsReady) return;

        const loadPlanet = () => {
            localStorage.setItem("fxHash", mintHash);
            window.fxHashGen();
            window.main();
            window.initPlanet(mintHash).then(() => {
                setIsPlanetInitialized(true);
            });
        };

        loadPlanet();
    }, [mintHash, arePlanetScriptsReady]);

    return {
        isPlanetInitialized,
        setArePlanetScriptsReady
    };
};

export default usePlanet;
