export function PayMethod() {
    return (
        <div className="payMethod">
            <div className="payMethod__tabs">
                <div className="payMethod__tabName payMethod__tabName--active">TEZ</div>
                <div className="payMethod__tabName">LP</div>
            </div>
            <div className="payMethod__content">
                <div className="payMethod__priceRow">
                    <div className="payMethod__price">0,10</div>
                    <div className="payMethod__price payMethod__price--active">1</div>
                    <div className="payMethod__price">10</div>
                </div>
                <div className="payMethod__text">Possible winnings:  <b>100 LP</b></div>
            </div>
        </div>
    )
}