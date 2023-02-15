import React, { useMemo } from "react";
import ReactTooltip from 'react-tooltip';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useContractServersContext } from "@context/ContractServersContext";

const MESSAGES = {
    isFull: "The server if already full :(",
    isGameRunning: "The game has already started :(",
}

const ServerSelector = () => {
    const {
        isLoading,
        contractServers,
        selectedServerIndex,
        selectNextServer,
        selectPreviousServer
    } = useContractServersContext();

    const loadingStateContent = useMemo(
        () => (
            <>
                <button className="server-selector__button" disabled>
                    <ArrowBackIosNewIcon />
                </button>
                <p className="server-selector__text">Loading servers...</p>
                <button className="server-selector__button" disabled>
                    <ArrowForwardIosIcon />
                </button>
            </>
        ),
        []
    );

    const readyStateContent = useMemo(() => {
        const selectedServer = contractServers[selectedServerIndex];
        const areButtonsDisabled = contractServers.length === 1;

        const { isFull, isGameRunning } = contractServers[selectedServerIndex] ?? {};
        const isServerUnavailable = isFull || isGameRunning;

        return (
            <>
                <button
                    onClick={selectNextServer}
                    className="server-selector__button"
                    disabled={areButtonsDisabled}
                >
                    <ArrowBackIosNewIcon />
                </button>
                <p
                    data-tip
                    data-for="serverUnavailableTooltip"
                    className={`server-selector__text ${isServerUnavailable ? "server-selector__text--unavailable" : ""}`.trimEnd()}
                >
                    {selectedServer?.name}
                </p>
                {isServerUnavailable && (
                    <ReactTooltip
                        id="serverUnavailableTooltip"
                        place="top"
                        type="dark"
                        effect="solid"
                    >
                        {isGameRunning
                            ? MESSAGES.isGameRunning
                            : isFull
                            ? MESSAGES.isFull
                            : ""
                        }
                    </ReactTooltip>
                )}
                <button
                    onClick={selectPreviousServer}
                    className="server-selector__button"
                    disabled={areButtonsDisabled}
                >
                    <ArrowForwardIosIcon />
                </button>
            </>
        );
    }, [contractServers, selectedServerIndex]);

    return (
        <div className="server-selector">
            <h2 className="server-selector__title">SELECT <b>SERVER:</b></h2>
            <div className="server-selector__content">
                {isLoading ? loadingStateContent : readyStateContent}
            </div>
        </div>
    )
};

export default ServerSelector;
