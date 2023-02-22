import { useState, useEffect } from "react";
import renderPlanet from "@services/planet/renderPlanet";

const usePlanet = (mintHash, planetCanvasRef) => {
    const [isPlanetLoaded, setIsPlanetLoaded] = useState(false);

    useEffect(() => {
        if (!mintHash) return;

        localStorage.setItem("fxHash", mintHash);
        renderPlanet(mintHash, planetCanvasRef);
        setIsPlanetLoaded(true);
    }, [ mintHash ]);

    return { isPlanetLoaded };
};

export default usePlanet;
