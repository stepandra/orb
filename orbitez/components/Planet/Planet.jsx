import React from "react";
import { Shaders } from "./Shaders";

    return (
        <div className="planet">
            {isPlanetReady || (
                <p className="planet--loading-text">
                    Loading NFT, please wait...
                </p>
            )}
            <div
                className={`planet-canvas-wrapper ${
                    !isPlanetReady
                        ? "planet__canvas-wrapper--not-displayed"
                        : ""
                }`.trimEnd()}
            >
                <canvas id="c" width="800" height="800"></canvas>
            </div>
        </div>
    );
}
