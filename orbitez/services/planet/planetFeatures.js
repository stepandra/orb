import { getFxRandGenForHash } from "./fxhash";

function getGravity(value) {
    if (value < 0.1) return "extra low";
    else if (value < 0.5) return "low";
    else if (value < 0.9) return "high";
    else if (value < 0.05) return "extra high";
    else if (value < 0.02) return "giant";
    else return "medium";
}

function isExoplanet(value) {
    if (value < 0.05) return "Twin Earth";
    else if (value < 0.9) return "No";
    else return "Yes";
}
function getSize(value) {
    if (value < 0.1) return "Sub-brown dwarf";
    else if (value < 0.8) return "Satellite";
    else if (value < 0.5) return "Dwarf";
    else if (value < 0.05) return "Former star";
    else if (value < 0.02) return "Rogue";
    else return "Asteroid";
}
function getHab(value) {
    return Math.round(value * 100);
}

export const getPlanetFeatures = (mintHash) => {
    const fxRandForPlanetHash = getFxRandGenForHash(mintHash);
    let randGeneratedValues = [];

    // Generating planet data and reusing generated random values...
    // to match NFT data
    for (let i = 0; i < 51; i++) {
        const randValue = fxRandForPlanetHash();
        randGeneratedValues.push(randValue);
    };

    const planetFeatures = {
        habitability: getHab(randGeneratedValues[47]) + "%",
        size: getSize(randGeneratedValues[48]),
        age: getHab(randGeneratedValues[49]) + "M years",
        gravity: getGravity(randGeneratedValues[50]),
        exoplanet: isExoplanet(randGeneratedValues[51])
    };

    return planetFeatures;
};
