import Head from 'next/head'
import Image from 'next/image';
import { useState } from 'react'
import { Header } from '@components/Header/Header';
import { Planet } from '@components/Planet/Planet';
import { PlanetDataList } from '@components/PlanetDataList/PlanetDataList';
import { StatList } from '@components/StatList/StatList';
import { PlanetScripts } from '@components/PlanetScripts/PlanetScripts';


export default function Leaderboard() {
    const [fxhash, setHash] = useState('opKnKPLvxekWsTEZqXUEqmsTCN95tHMtiKVnTbN7qX2uersNYE2')
    return (
        <>
            <Head>
                <title>Leaderboard - Orbitez.io</title>
            </Head>
            <PlanetScripts onScriptsReady={() => setArePlanetScriptsReady(true)} />

            <Header/>
            
            <main className='leaderBoard container'>
                <div className="leaderBoard__inner">

                    <div className="leaderBoard__left">
                        <StatList setHash={setHash}/>
                    </div>

                    <div className="leaderBoard__center">
                        <Planet mintHash={fxhash}/>
                        <a className="leaderBoard__btn btn btn--center" href="#">BUY</a>
                    </div>
                    
                    <div className="leaderBoard__right">
                        <PlanetDataList className='planetData--clear'/>
                    </div>

                    <div className="leaderBoard__bg">
                        <Image src='/img/bg-leaderboard.png' layout='fill' />
                    </div>

                    <p className="leaderBoard__planetName"><span>NAME:</span> NFT#9876541</p>
                    <a className="leaderBoard__share">Share</a>
                
                </div>
            </main>
        </>
    )
}