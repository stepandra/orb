import { useEffect } from "react";
import PlanetRender from "@services/planet/PlanetRender";

const usePlanetRender = () => {
    // Dirty way to pass PlanetRender to /public/assets/js/main_out.js file
    useEffect(() => {
        window.PlanetRender = PlanetRender;
    }, []);
};

export default usePlanetRender;
