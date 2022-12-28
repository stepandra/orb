import React from "react";
import useGameProgressTimer from "@hooks/useGameProgressTimer";

const GameProgressTimer = ({ blocksRemaining }) => {
    const {
        isLoading,
        activeTimerPiecesCount,
        inactiveTimerPiecesCount
    } = useGameProgressTimer(blocksRemaining);

    if (isLoading) {
        return <p className="gameTimer gameTimer__num">Loading...</p>;
    };

    const activeArray = [...Array(activeTimerPiecesCount)];
    const inactiveArray = [...Array(inactiveTimerPiecesCount)];

    const activeTimerPiecesList = activeArray.map((_, index) => (
        <div
            key={index}
            className="gameTimer__item gameTimer__item--active"
        ></div>
    ));

    const inactiveTimerPiecesList = inactiveArray.map((_, index) => (
        <div
            key={index}
            className="gameTimer__item"
        ></div>
    ));

    return (
        <div className="gameTimer">
            <div className="gameTimer__num">
                Blocks remaining: {blocksRemaining}
            </div>
            <div className="gameTimer__list">
                {activeTimerPiecesList}
                {inactiveTimerPiecesList}
            </div>
        </div>
    );
};

export default GameProgressTimer;
