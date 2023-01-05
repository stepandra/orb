import React from "react";
import { DigitalOceanDeployment } from "./DigitalOceanDeployment";

export function DeploymentModal({ closeModal }) {
    return (
        <div className='overlays'>
            <div className='popUp deploymentModal'>
                <div
                    className='popUp__close'
                    onClick={closeModal}></div>

                <h2 className="deploymentModal__header">
                    Deploy your own Orbitez server and Tezos node
                </h2>

                <div className="deploymentModal__content">
                    <DigitalOceanDeployment />
                </div>
            </div>
        </div>
    );
}
