import { PlanetGenerator }  from '@components/PlanetGenerator/PlanetGenerator';

export function Planet({ mintHash }) {
    return (
        <div className="planet">
            <PlanetGenerator mint_hash={mintHash} />
        </div>
    )
}