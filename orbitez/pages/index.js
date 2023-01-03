import React            from 'react';
import Head             from 'next/head'
import Image            from 'next/image';
import Link             from 'next/link';
import { useRouter }    from 'next/router';
import { useTezos }     from '@hooks/useTezos';
import axios            from 'axios';

export default function Landing() {
    const { connectWallet, disconnectWallet, address, Tezos, balance } = useTezos()
    const router = useRouter()
    const joinGame = async () => {
        if (address == '') {
            await connectWallet()
        }
        router.push('/dashboard')
    }

    const deployServer = () => {
        axios.get('/api/deploy_orbitez_do')
    }

    return (
        <>
            <Head>
                <title>Orbitez.io</title>
            </Head>
            
            <main className='lp container container--small'>
                <div className='lp__content'>
                    <Image 
                        className="lp__logo" 
                        src="/img/logo-big.png" 
                        width={982} 
                        height={282}
                        alt="Logo" 
                    />
                    <p className="lp__text">
                        Fight with players from all over the world as you try to become the biggest Planet in a solar system! Control your tiny planet and eat other players to grow larger. Mint your own, unique generative planet as NFT to enter the battlefield!
                        </p>
                    <Link href="/dashboard">
                        <a className="lp__btn btn btn--center">Join the game</a>
                    </Link>
                </div>
                <div className='lp__bg'>
                    <video className="lp__video" loop muted autoPlay poster={"/img/lp-bg-poster.png"}>
                        <source src="/video/lp-bg-video-6.mp4" type="video/mp4" />
                        <source src="video/lp-bg-video-8.webm" type="video/webm" />
                    </video>
                    <div className="lp__overlay"></div>
                </div>
            </main>
        </>
    )
}

