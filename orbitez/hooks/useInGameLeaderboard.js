import { useState, useEffect } from "react";

const useInGameLeaderboard = () => {
    const [top5PlayersList, setTop5PlayersList] = useState([]);
    const [currentPlayerRankData, setCurrentPlayerRankData] = useState(null);

    useEffect(() => {
        const handleInGameLeaderboardUpdate = (event) => {
            const playersListRawArray = event.detail.leaderboard.items;

            const currentPlayerIndex = playersListRawArray.findIndex(
                (playersListItem) => playersListItem.me === true
            );

            if (currentPlayerIndex !== -1) {
                const currentPlayer = playersListRawArray[currentPlayerIndex];

                setCurrentPlayerRankData({
                    ...currentPlayer,
                    rank: currentPlayerIndex + 1
                });
            } else {
                setCurrentPlayerRankData(null);
            }

            const playersListTop5RawArray = playersListRawArray.slice(0, 5);

            const formattedPlayersList = playersListTop5RawArray.map(
                (playersListItem, index) => {
                    return { ...playersListItem, rank: index + 1 };
                }
            );

            setTop5PlayersList(formattedPlayersList);
        };

        window.addEventListener(
            "inGameLeaderboardUpdate",
            handleInGameLeaderboardUpdate
        );
        return () =>
            window.removeEventListener(
                "inGameLeaderboardUpdate",
                handleInGameLeaderboardUpdate
            );
    }, []);

    const isCurrentPlayerInTop5 =
        currentPlayerRankData?.rank >= 1 && currentPlayerRankData?.rank <= 5;

    return {
        top5PlayersList,
        currentPlayerRankData,
        isCurrentPlayerInTop5
    };
};

export default useInGameLeaderboard;
