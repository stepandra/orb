window.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

window.bundle = async () => {
    function n(n) {
        return Math.round(100 * n);
    }
    var r;
    window.fxrand()
    window.$fxhashFeatures = {
        habitability: n(window.fxrand()) + "%",
        size:
            ((r = window.fxrand()),
                r < 0.1 ?
                "Sub-brown dwarf" :
                r < 0.5 ?
                "Satellite" :
                r < 0.7 ?
                "Dwarf" :
                r < 0.05 ?
                "Former star" :
                r < 0.02 ?
                "Rogue" :
                void 0),
        age: n(window.fxrand()) + "M years",
        gravity: (function(n) {
            return n < 0.1 ?
                "extra low" :
                n < 0.5 ?
                "low" :
                n < 0.9 ?
                "high" :
                n < 0.05 ?
                "extra high" :
                n < 0.02 ?
                "giant" :
                "medium";
        })(window.fxrand()),
        exoplanet: (function(n) {
            return n < 0.05 ? "Twin Earth" : n < 0.9 ? "No" : "Yes";
        })(window.fxrand()),
    };
    const e = document.createElement("div");
    document.body.prepend(e);
    
}

// window.bundle()