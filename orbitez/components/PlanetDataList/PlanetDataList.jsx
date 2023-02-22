import React, { useMemo } from 'react';
import usePlanetFeatures from '@hooks/usePlanetFeatures';

const DEFAULT_PLANET_FEATURES = {
    habitability: 0,
    size: 0,
    age: 0,
    gravity: 0,
    exoplanet: false
}

export function PlanetDataList({ className='', mintHash }) {

    const { isLoaded, planetFeatures } = usePlanetFeatures(mintHash);

    const calculatedPlanetFeatures = useMemo(
        () => (isLoaded ? planetFeatures : DEFAULT_PLANET_FEATURES),
        [isLoaded, mintHash]
    );

    return (
        <div className={`planetData ${className}`}>
            <h2 className="planetData__title">PLANET <b>DATA:</b></h2>
            <ul className="planetData__list">
                {Object.keys(calculatedPlanetFeatures).map((key) => (
                    <li
                        key={"features-" + key}
                        className="planetData__item"
                    >
                        {key} <span>{calculatedPlanetFeatures[key]}</span>
                    </li>
                ))}
                <li className="planetData__text">
                    Sell or Buy planets <br />
                    on <a className="planetData__link" href="https://www.fxhash.xyz/marketplace/generative/3808">Marketplace</a>
                </li>
            </ul>

        </div>
    )
}