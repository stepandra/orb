import React from 'react';
import Head from 'next/head'
import { useRouter } from 'next/router';
import { useTezos } from '@hooks/useTezos';
import { useServerContext } from '@context/ServerContext';
import { CONTRACT_ADDRESS } from '../constants';


import { Header } from '@components/Header/Header';

export default function LastGameStats() {
    const { address, Tezos } = useTezos();
    const router = useRouter();

    const { serverName } = useServerContext();

    const payDividends = async () => {
      const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
      await contract.methods.end_game(serverName, serverName, router.query.packed, router.query.signed).send({ storageLimit: 1000 })
      router.push('/dashboard')
    }

    return (
        <div className="background">
            <Head>
                <title>Game Winners - Orbitez.io</title>
            </Head>
            <Header />
            <main className='container container--small'>

                <div className="statList statList--wide">
                    <ul className="statList__list">
                      {
                        router.query.leaderboard && JSON.parse(router.query.leaderboard).map((player, index) => (
                          <li key={'player-' + index} className={`statList__item ${address === player.address ? 'statList__item--active' : ''}`}>
                            <p className="statList__rank">{index + 1}</p>
                            <p className="statList__nft">{player.address}</p> 
                            <p className="statList__score">{player.amount}</p>
                          </li>
                        ))
                      }
                    </ul>
                </div>
                <a onClick={() => payDividends()} className="btn btn--center" >
                    Claim Rewards
                </a>
                <a onClick={() => {router.push('/dashboard')}} className="btn btn--center" style={{ marginTop: '2rem' }}>
                    Dashboard
                </a>

            </main>
        </div>
    )
}