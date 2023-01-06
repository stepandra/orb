import React, { useRef } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import useDigitalOceanDeployment from "@hooks/useDigitalOceanDeployment";
import { LoadingButton } from "./LoadingButton";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';

const regionsList = [
    { name: "New York City", value: "NYC3" },
    { name: "San Francisco", value: "SFO3" },
    { name: "Toronto, Canada", value: "TOR1" },
    { name: "London, United Kingdom", value: "LON1" },
    { name: "Frankfurt, Germany", value: "FRA1" },
    { name: "Amsterdam, the Netherlands", value: "AMS3" },
    { name: "Singapore", value: "SGP1" },
    { name: "Bangalore, India", value: "BLR1" }
];

export function DigitalOceanDeployment() {
    const {
        isLoading,
        deployTezos,
        setDeployTezos,
        token,
        setToken,
        progress,
        tezRpcUrl,
        serverName,
        setServerName,
        regionIndex,
        setRegionIndex,
        roomSize,
        setRoomSize,
        gameLength,
        setGameLength,
        deployDOServer,
        activateServer,
    } = useDigitalOceanDeployment(regionsList);

    const tooltipTargetRef = useRef(null);

    const areServerSettingValid =
        serverName !== "" && roomSize >= 3 && gameLength >= 5;

    if (isLoading) {
        return (
            <div className="deploymentModal__content-wrapper">Loading...</div>
        );
    }

    return (
        <>
            <div className="deploymentModal__content-wrapper">
                <img
                    width={progress === 100 ? 0 : 100}
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/DigitalOcean_logo.svg/1200px-DigitalOcean_logo.svg.png"
                />
                {progress == 0 && (
                    <div className="regionSelector">
                        <h3 className="regionSelector__title">Select region</h3>
                        <div className="regionSelector__switcher">
                            <button
                                className="regionSelector__arrow-button"
                                onClick={() =>
                                    regionIndex === 0
                                        ? setRegionIndex(regionsList.length - 1)
                                        : setRegionIndex(regionIndex - 1)
                                }
                            >
                                ←
                            </button>
                            <p className="regionSelector__item">
                                {regionsList[regionIndex].name}
                            </p>
                            <button
                                className="regionSelector__arrow-button"
                                onClick={() =>
                                    regionIndex === regionsList.length - 1
                                        ? setRegionIndex(0)
                                        : setRegionIndex(regionIndex + 1)
                                }
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
                {progress != 0 && progress !== 100 && (
                    <>
                        <div style={{ width: "80%" }}>
                            <ProgressBar completed={progress} />
                        </div>
                    </>
                )}
                {progress == 0 && (
                    <>
                        <input
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your DigitalOcean read/write token here"
                        />
                        <input
                            placeholder="Server Name*"
                            type="text"
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                        />
                        <div
                            className="deployTezos"
                            onClick={(e) => {
                                setDeployTezos(!deployTezos);
                                localStorage.setItem(
                                    "DEPLOY_TEZ_NODE",
                                    deployTezos ? "false" : "true"
                                );
                            }}
                        >
                            <input
                                className="deployTezos__input"
                                type="checkbox"
                                checked={deployTezos}
                                readOnly
                            />
                            <h3 className="deployTezos__title">
                                Deploy Tezos node
                            </h3>
                        </div>
                    </>
                )}
                {progress !== 100 && deployTezos == true && (
                    <p className="deploymentModal__text-content">
                        The deployment of new Orbitez server and Tezos node
                        takes about 90 min.
                    </p>
                )}
                {progress !== 100 && deployTezos == false && (
                    <p className="deploymentModal__text-content">
                        The deployment of a new Orbitez server will take roughly
                        15 min.
                    </p>
                )}
                {progress === 0 && (
                    <button
                        className={`planet__btn btn btn--center serverDeploymentSettings__deploy-button ${
                            token == ""
                                ? "serverDeploymentSettings__deploy-button--disabled"
                                : ""
                        }`.trimEnd()}
                        disabled={token === "" || serverName === ""}
                        onClick={deployDOServer}
                    >
                        Deploy Server
                    </button>
                )}
                {progress > 0 && progress < 100 && (
                    <LoadingButton label="Deploy Server" />
                )}
                {progress === 100 && tezRpcUrl && (
                    <>
                        <p className="serverDeploymentSettings__text">
                            Your own Tezos Node is live. Add the following RPC
                            to your wallet:
                            <br />
                            <br />
                            <CopyToClipboard
                                text={`https://${tezRpcUrl}`}
                                onCopy={() => {
                                    ReactTooltip.show(tooltipTargetRef.current)
                                }}
                            >
                                <code
                                    ref={tooltipTargetRef}
                                    data-tip="Copied to clipboard!"
                                >
                                    https://{tezRpcUrl}
                                </code>
                            </CopyToClipboard>
                            <ReactTooltip
                                place="top"
                                type="dark"
                                effect="solid"
                                event="none"
                                afterShow={() =>
                                    setTimeout(ReactTooltip.hide, 1200)
                                }
                            />
                        </p>
                        <br />
                    </>
                )}
                {progress == 100 && (
                    <>
                        <p className="serverDeploymentSettings__text">
                            Your game server is ready! Hit activate button to
                            start receiving rewards for every game hosted on
                            your server.
                            <br />
                            <br />
                        </p>
                        <div className="serverDeploymentSettings">
                            <input
                                className="serverDeploymentSettings__input"
                                placeholder="Room Size (3+)"
                                type="number"
                                value={roomSize}
                                onChange={(e) => setRoomSize(e.target.value)}
                            />
                            <input
                                className="serverDeploymentSettings__input"
                                placeholder="Game Length (5+)"
                                type="number"
                                value={gameLength}
                                onChange={(e) => setGameLength(e.target.value)}
                            />
                            <button
                                className={`planet__btn btn btn--center serverDeploymentSettings__button ${
                                    areServerSettingValid
                                        ? ""
                                        : "serverDeploymentSettings__button--disabled"
                                }`.trimEnd()}
                                disabled={!areServerSettingValid}
                                onClick={activateServer}
                            >
                                Activate
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
