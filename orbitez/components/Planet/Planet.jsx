import React, { useRef } from "react";
import usePlanet from "@hooks/usePlanet";

export function Planet({ mintHash }) {
    const planetCanvasRef = useRef(null);

    const { isPlanetLoaded } = usePlanet(mintHash, planetCanvasRef);

    return (
        <div className="planet">
            {isPlanetLoaded || (
                <p className="planet--loading-text">
                    Loading NFT, please wait...
                </p>
            )}
            <div
                className={`planet-canvas-wrapper ${
                    !isPlanetLoaded
                        ? "planet__canvas-wrapper--not-displayed"
                        : ""
                }`.trimEnd()}
            >
                <canvas ref={planetCanvasRef} width="800" height="800"></canvas>
            </div>
        </div>
    );
}
