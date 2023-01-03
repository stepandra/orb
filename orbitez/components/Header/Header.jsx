import Link             from 'next/link';
import Image            from 'next/image';
import { useRouter }    from 'next/router';
import { useTezos }     from '@hooks/useTezos';


export function Header() {
    const { connectWallet, disconnectWallet, address, balance } = useTezos();
    const router = useRouter();
    
    let link = '/leaderboard';
    let linkText = 'LeaderBoard';
    let linkIcon = '/img/icon-leaderboard.png';

    if (router.pathname === "/leaderboard") {
        link = "/dashboard"
        linkText = "Back";
        linkIcon = '/img/icon-back.png';
    }

    const connectAndReload = () => {
        connectWallet().then(() => {
            router.reload()
        })
    }

    const disconnectAndReload = () => {
        disconnectWallet().then(() => {
            router.reload()
        })
    }

    return (
        <header className="header container">
            <div className="header__linkBlock">
                <Image 
                    className="header__icon" 
                    src={linkIcon} 
                    layout="fixed" 
                    width={21} 
                    height={31}
                    alt=""
                />
                <Link href={link}>
                    <a className="header__link">
                        {linkText}
                    </a>
                </Link>
            </div>

            <div className="header__money money">
                <div className="money__item">
                    <p className="money__name">TEZ</p>
                    <p className="money__num">{address != '' ? balance.toFixed(2) : '0'}</p>
                </div>
                <div className="money__item">
                    <div className="money__name">LP</div>
                    <div className="money__num">0</div>
                </div>
            </div>

            <div className="header__linkBlock">
                <Image 
                    className="header__icon" 
                    src="/img/icon-log-out.png" 
                    layout="fixed" 
                    width={43} 
                    height={34}
                    alt=""
                />
                <a className="header__link" onClick={() => address == '' ? connectAndReload() : disconnectAndReload()}>
                    {address == '' ? 'Connect wallet' : 'Log out'}
                </a>
            </div>
        </header>
    )
}

