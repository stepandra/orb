
window.fxHashGen = () => {
//---- do not edit the following code (you can indent as you wish)
let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
window.fxhash = localStorage.getItem("fxHash")
// "oo" + Array(49).fill(0).map(_ => alphabet[(Math.random() * alphabet.length) | 0]).join('')
let b58dec = (str) => str.split('').reduce((p, c, i) => p + alphabet.indexOf(c) * (Math.pow(alphabet.length, str.length - i - 1)), 0)
let fxhashTrunc = window.fxhash.slice(2)
let regex = new RegExp(".{" + ((window.fxhash.length / 4) | 0) + "}", 'g')
let hashes = fxhashTrunc.match(regex).map(h => b58dec(h))
let sfc32 = (a, b, c, d) => {
    return () => {
    a |= 0; b |= 0; c |= 0; d |= 0
    var t = (a + b | 0) + d | 0
    d = d + 1 | 0
    a = b ^ b >>> 9
    b = c + (c << 3) | 0
    c = c << 21 | c >>> 11
    c = c + t | 0
    return (t >>> 0) / 4294967296
    }
}
window.fxrand = sfc32(...hashes)
//---- /do not edit the following code 
}

function getGravity(value) {
if (value < 0.1) return "extra low"
else if (value < 0.5) return "low"
else if (value < 0.9) return "high"
else if (value < 0.05) return "extra high"
else if (value < 0.02) return "giant"
else return "medium"
}

function isExoplanet(value) {
if (value < 0.05) return "Twin Earth"
else if (value < 0.9) return "No"
else return "Yes"
}
function getSize(value) {
if (value < 0.1) return "Sub-brown dwarf"
else if (value < 0.8) return "Satellite"
else if (value < 0.5) return "Dwarf"
else if (value < 0.05) return "Former star"
else if (value < 0.02) return "Rogue"
else return "Asteroid"
}
function getHab(value) {
return Math.round(value * 100)
}