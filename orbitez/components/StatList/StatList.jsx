import { useEffect, useState } from "react"

const leaderBoardData = [
    {
        id: 1,
        rank: '1',
        token_id: '456677',
        score: '722',
        price: '100'
    },
    {
        id: 2,
        rank: '2',
        token_id: '6868900908',
        score: '551',
        price: '29.002'
    },
    {
        id: 3,
        rank: '3',
        token_id: '8975643200',
        score: '520',
        price: '17.002'
    },
    {
        id: 4,
        rank: '4',
        token_id: '878793',
        score: '500',
        price: '10.552'
    },
    {
        id: 5,
        rank: '5',
        token_id: '8786657',
        score: '477',
        price: '9.002'
    },
    {
        id: 6,
        rank: '6',
        token_id: '4566821',
        score: '472',
        price: '8.882'
    },
    {
        id: 7,
        rank: '7',
        token_id: '897543',
        score: '469',
        price: '8.002'
    },
    {
        id: 8,
        rank: '8',
        token_id: '45167739',
        score: '465',
        price: '5.05'
    },
    {
        id: 9,
        rank: '9',
        token_id: '45887787',
        score: '445',
        price: '4'
    },
    {
        id: 10,
        rank: '10',
        token_id: '55667712',
        score: '420',
        price: '2.45'
    }
]

export function StatList({ setHash }) {
    const [planetSelected, setPlanetSelected] = useState(3)
    useEffect(( ) => {
        setHash(Math.random() * 123 + '')
    }, [planetSelected])
    return (
        <div className="statList">
            <h2 className="statList__title">LEADERBOARD:</h2>
            <ul className="statList__list">

                {leaderBoardData.map((planet, index) => (
                    <li 
                        className={`statList__item ${index === planetSelected ? "statList__item--active" : ""}`} 
                        onClick={() => setPlanetSelected(index)}
                        key={planet.token_id}
                    >
                        <p className="statList__rank">{planet.rank}.</p>
                        <p className="statList__nft">NFT #{planet.token_id}</p> 
                        <p className="statList__score">{planet.score} pts</p>
                        <p className="statList__price">{planet.price} ꜩ</p>
                    </li>
                ))}
                
            </ul>
        </div>
    )
}