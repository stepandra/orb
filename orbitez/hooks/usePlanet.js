import { useState, useEffect } from "react";
import PlanetRender from "@services/planet/PlanetRender";

const usePlanet = (mintHash, planetCanvasRef) => {
    const [isPlanetLoaded, setIsPlanetLoaded] = useState(false);

    useEffect(() => {
        if (!mintHash) return;

        localStorage.setItem("fxHash", mintHash);
        const planet = new PlanetRender(mintHash, planetCanvasRef);
        planet.initAnimation();

        setIsPlanetLoaded(true);

        return () => planet.stopAnimation();
    }, [ mintHash ]);

    return { isPlanetLoaded };
};

export default usePlanet;
