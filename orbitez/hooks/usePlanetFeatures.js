import { useState, useEffect } from "react";
import { getPlanetFeatures } from "@services/planet/planetFeatures";

const usePlanetFeatures = (mintHash) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [planetFeatures, setPlanetFeatures] = useState(null);

    useEffect(() => {
        if (!mintHash) return;

        const planetFeatures = getPlanetFeatures(mintHash);
        setPlanetFeatures(planetFeatures);
        setIsLoaded(true);
    }, [ mintHash ]);

    return { isLoaded, planetFeatures };
};

export default usePlanetFeatures;
