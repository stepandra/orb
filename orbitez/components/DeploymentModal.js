import React, { useState } from "react";
import { DigitalOceanDeployment } from "./DigitalOceanDeployment";

export function DeploymentModal({ closeModal }) {
    return (
        <div className='overlays'>
            <div className='popUp'>
                <div
                    className='popUp__close'
                    onClick={() => closeModal()}></div>

                <h2
                    style={{
                        width: "100%",
                        margin: "2rem",
                        textAlign: "center",
                    }}>
                    Deploy your own Orbitez server and Tezos node
                </h2>

                <div
                    style={{
                        display: "flex",
                        width: "100%",
                        flexWrap: "wrap",
                    }}>
                    <DigitalOceanDeployment />
                </div>
            </div>
        </div>
    );
}
