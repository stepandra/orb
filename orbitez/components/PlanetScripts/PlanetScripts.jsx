import React, { memo } from "react";
import Script from "next/script";

function PlanetScriptsComponent({ onScriptsReady }) {
    return (
        <>
            <Script src="/assets/js/seedrandom.js" />
            <Script src="/assets/js/webgl/fxhash.js" />
            <Script src="/assets/js/webgl/main.js" onReady={onScriptsReady} />
        </>
    );
}

export const PlanetScripts = memo(PlanetScriptsComponent);
