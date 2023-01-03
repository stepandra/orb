import React from "react";
import useInGameLeaderboard from "@hooks/useInGameLeaderboard";

const InGameLeaderboard = () => {
    const {
        top5PlayersList,
        currentPlayerRankData,
        isCurrentPlayerInTop5
    } = useInGameLeaderboard();

    if (top5PlayersList.length === 0) {
        return (
            <div className="header__playersList playersList">
                <ol className="playersList__list playersList__list--gen">
                    <span>Leaderboard Loading...</span>
                </ol>
            </div>
        );
    }

    return (
        <div className="header__playersList playersList">
            <ol className="playersList__list playersList__list--gen">
                {top5PlayersList.map((playersListItem) => {
                    return (
                        <li
                            key={playersListItem.name}
                            className={`playersList__item ${
                                playersListItem.me
                                    ? "playersList__item--active"
                                    : ""
                            }`}
                        >
                            <p className="playersList__num">
                                {playersListItem.rank}.
                            </p>
                            <p className="playersList__name">
                                {playersListItem.name}
                            </p>
                        </li>
                    );
                })}
            </ol>
            {!isCurrentPlayerInTop5 && currentPlayerRankData && (
                <ol className="playersList__list">
                    <li className="playersList__item playersList__item--active">
                        <p className="playersList__num">
                            {currentPlayerRankData.rank}
                        </p>
                        <p className="playersList__name">
                            {currentPlayerRankData.name}
                        </p>
                    </li>
                </ol>
            )}
        </div>
    );
};

export default InGameLeaderboard;
