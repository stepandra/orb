window.main = () => {

    var canvas = document.getElementById("c");
    var structs = {};
    var slots = {};
    let randGeneratedValues = [];

    function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    
    //   console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    }

    function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    
    //   console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    }
    function resize(canvas) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
    
    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {
    
        // Make the canvas the same size
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
    }

    var gl = canvas.getContext("webgl", {
        preserveDrawingBuffer: true,
        premultipliedAlpha: false
    });
    var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
    var fragmentShaderSource = document.getElementById("planet-shader").text;
    // console.log(fragmentShaderSource)
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = createProgram(gl, vertexShader, fragmentShader);
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    var uCities = gl.getUniformLocation(program, "cities");
    var uTime = gl.getUniformLocation(program, "time");
    var uLeft = gl.getUniformLocation(program, "left");
    var uTop = gl.getUniformLocation(program, "top");
    var uResolution = gl.getUniformLocation(program, "resolution");
    var uAngle = gl.getUniformLocation(program, "angle");
    var uRotspeed = gl.getUniformLocation(program, "rotspeed");
    var uLight = gl.getUniformLocation(program, "light");
    var uZLight = gl.getUniformLocation(program, "zLight");
    var uLightColor = gl.getUniformLocation(program, "lightColor");
    var uModValue = gl.getUniformLocation(program, "modValue");
    var uNoiseOffset = gl.getUniformLocation(program, "noiseOffset");
    var uNoiseScale = gl.getUniformLocation(program, "noiseScale");
    var uNoiseScale2 = gl.getUniformLocation(program, "noiseScale2");
    var uNoiseScale3 = gl.getUniformLocation(program, "noiseScale3");
    var uCloudNoise = gl.getUniformLocation(program, "cloudNoise");
    var uCloudiness = gl.getUniformLocation(program, "cloudiness");
    var uOcean = gl.getUniformLocation(program, "ocean");
    var uIce = gl.getUniformLocation(program, "ice");
    var uCold = gl.getUniformLocation(program, "cold");
    var uTemperate = gl.getUniformLocation(program, "temperate");
    var uWarm = gl.getUniformLocation(program, "warm");
    var uHot = gl.getUniformLocation(program, "hot");
    var uSpeckle = gl.getUniformLocation(program, "speckle");
    var uClouds = gl.getUniformLocation(program, "clouds");
    var uWaterLevel = gl.getUniformLocation(program, "waterLevel");
    var uRivers = gl.getUniformLocation(program, "rivers");
    var uTemperature = gl.getUniformLocation(program, "temperature");
    var uHaze = gl.getUniformLocation(program, "haze");

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // three 2d points
    var positions = [
    -1, -1,
    -1, 1,
    1, 1,
    -1, -1,
    1, 1,
    1, -1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    var vWaterLevel = 0;
    var vRivers = 0;
    var vTemperature = 0;
    var vCold = [0.5, 0.5, 0.5];
    var vOcean = [0.5, 0.5, 0.5];
    var vTemperate = [0.5, 0.5, 0.5];
    var vWarm = [0.5, 0.5, 0.5];
    var vHot = [0.5, 0.5, 0.5];
    var vSpeckle = [0.5, 0.5, 0.5];
    var vClouds = [0.9, 0.9, 0.9];
    var vCloudiness = 0.35;
    var vLightColor = [1.0, 1.0, 1.0];
    var vHaze = [0.15, 0.15, 0.2];

    var vAngle = 0.3;
    var vRotspeed = 0.01;
    var vLight = 1.9;
    var vZLight = 0.5;
    var vModValue = 29;
    var vNoiseOffset = [0, 0];
    var vNoiseScale = [11, 8];
    var vNoiseScale2 = [200, 200];
    var vNoiseScale3 = [50, 50];
    var vCloudNoise = [6, 30];

    function renderPlanet(sz) {
        const { width: htmlElWidth, height: htmlElHeight } = document.documentElement.getBoundingClientRect();
        sz = Math.min((htmlElWidth - 960) * (0.65) - ((htmlElHeight - 960) * 0.02), 415) // || Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.40);

        const canvasElement = document.getElementById("c");
        const canvasHeight = canvasElement.getBoundingClientRect().height;
        const canvasWidth = canvasElement.getBoundingClientRect().width;

        // Apply calculated styles
        canvasElement.style.width = sz + "px";
        canvasElement.style.height = sz + "px";
        canvasElement.style.top = (htmlElHeight / 2 - canvasHeight / 2) + "px";
        canvasElement.style.left = (htmlElWidth / 2 - canvasWidth / 2) + "px";

        // Resize canvas
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionAttributeLocation);
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset)

        gl.uniform1i(uCities, 0);
        gl.uniform1f(uTime, t * 0.001); // qqDPS
        var shift = Math.round(sz / 40);
        gl.uniform1f(uLeft, -shift);
        gl.uniform1f(uTop, -shift);
        var res = Math.round(sz * 0.95);
        gl.uniform2f(uResolution, res, res);
        gl.uniform1f(uAngle, vAngle);
        gl.uniform1f(uRotspeed, vRotspeed);
        gl.uniform1f(uLight, vLight);
        gl.uniform1f(uZLight, vZLight);
        gl.uniform3fv(uLightColor, vLightColor);
        gl.uniform1f(uModValue, vModValue);
        gl.uniform2fv(uNoiseOffset, vNoiseOffset);
        gl.uniform2fv(uNoiseScale, vNoiseScale);
        gl.uniform2fv(uNoiseScale2, vNoiseScale2);
        gl.uniform2fv(uNoiseScale3, vNoiseScale3);
        gl.uniform2fv(uCloudNoise, vCloudNoise);
        gl.uniform1f(uCloudiness, vCloudiness);
        gl.uniform3fv(uOcean, vOcean);
        gl.uniform3f(uIce, 250/255.0, 250/255.0, 250/255.0);
        gl.uniform3fv(uCold, vCold);//53/255.0, 102/255.0, 100/255.0);
        gl.uniform3fv(uTemperate, vTemperate);//79/255.0, 109/255.0, 68/255.0);
        gl.uniform3fv(uWarm, vWarm);//119/255.0, 141/255.0, 82/255.0);
        gl.uniform3fv(uHot, vHot);//223/255.0, 193/255.0, 148/255.0);
        gl.uniform3fv(uSpeckle, vSpeckle);
        gl.uniform3fv(uClouds, vClouds);
        gl.uniform3fv(uHaze, vHaze);
        gl.uniform1f(uWaterLevel, vWaterLevel);
        gl.uniform1f(uRivers, vRivers);
        gl.uniform1f(uTemperature, vTemperature);

        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);    
    }

    var vertexShaderSource2 = document.getElementById("2d-vertex-shader").text;
    var fragmentShaderSource2 = document.getElementById("map-shader").text;
    var vertexShader2 = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource2);
    var fragmentShader2 = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource2);
    var program2 = createProgram(gl, vertexShader2, fragmentShader2);
    var positionAttributeLocation2 = gl.getAttribLocation(program2, "a_position");

    var u2Cities = gl.getUniformLocation(program2, "cities");
    var u2Time = gl.getUniformLocation(program2, "time");
    var u2Left = gl.getUniformLocation(program2, "left");
    var u2Top = gl.getUniformLocation(program2, "top");
    var u2Resolution = gl.getUniformLocation(program2, "resolution");
    var u2Angle = gl.getUniformLocation(program2, "angle");
    var u2Rotspeed = gl.getUniformLocation(program2, "rotspeed");
    var u2Light = gl.getUniformLocation(program2, "light");
    var u2ZLight = gl.getUniformLocation(program2, "zLight");
    var u2LightColor = gl.getUniformLocation(program2, "lightColor");
    var u2ModValue = gl.getUniformLocation(program2, "modValue");
    var u2NoiseOffset = gl.getUniformLocation(program2, "noiseOffset");
    var u2NoiseScale = gl.getUniformLocation(program2, "noiseScale");
    var u2NoiseScale2 = gl.getUniformLocation(program2, "noiseScale2");
    var u2NoiseScale3 = gl.getUniformLocation(program2, "noiseScale3");
    var u2CloudNoise = gl.getUniformLocation(program2, "cloudNoise");
    var u2Cloudiness = gl.getUniformLocation(program2, "cloudiness");
    var u2Ocean = gl.getUniformLocation(program2, "ocean");
    var u2Ice = gl.getUniformLocation(program2, "ice");
    var u2Cold = gl.getUniformLocation(program2, "cold");
    var u2Temperate = gl.getUniformLocation(program2, "temperate");
    var u2Warm = gl.getUniformLocation(program2, "warm");
    var u2Hot = gl.getUniformLocation(program2, "hot");
    var u2Speckle = gl.getUniformLocation(program2, "speckle");
    var u2Clouds = gl.getUniformLocation(program2, "clouds");
    var u2WaterLevel = gl.getUniformLocation(program2, "waterLevel");
    var u2Rivers = gl.getUniformLocation(program2, "rivers");
    var u2Temperature = gl.getUniformLocation(program2, "temperature");
    var u2Haze = gl.getUniformLocation(program2, "haze");

    function renderMap(sz) {
        sz = sz || 1024;


        const { width: htmlElWidth, height: htmlElHeight } = document.documentElement.getBoundingClientRect();

        const canvasElement = document.getElementById("c");
        const canvasHeight = canvasElement.getBoundingClientRect().height;
        const canvasWidth = canvasElement.getBoundingClientRect().width;

        // Apply calculated styles
        canvasElement.style.width = sz + "px";
        canvasElement.style.height = (sz / 2) + "px";
        canvasElement.style.top = (htmlElHeight / 2 - canvasHeight / 2) + "px";
        canvasElement.style.left = (htmlElWidth / 2 - canvasWidth / 2) + "px";

        // Resize canvas
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        // Tell it to use our program (pair of shaders)
        gl.useProgram(program2);
        gl.enableVertexAttribArray(positionAttributeLocation2);
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation2, size, type, normalize, stride, offset)

        gl.uniform1i(u2Cities, 0);
        gl.uniform1f(u2Time, t * 0.001); // qqDPS
        var resFake = Math.round(380 / 1024 * sz);
        var offsetFake = Math.round(-10 / 1024 * sz);
        gl.uniform1f(u2Left, offsetFake);
        gl.uniform1f(u2Top, offsetFake);
        gl.uniform2f(u2Resolution, resFake, resFake);
        gl.uniform1f(u2Angle, vAngle);
        gl.uniform1f(u2Rotspeed, vRotspeed);
        gl.uniform1f(u2Light, vLight);
        gl.uniform1f(u2ZLight, vZLight);
        gl.uniform3fv(u2LightColor, vLightColor);
        gl.uniform1f(u2ModValue, vModValue);
        gl.uniform2fv(u2NoiseOffset, vNoiseOffset);
        gl.uniform2fv(u2NoiseScale, vNoiseScale);
        gl.uniform2fv(u2NoiseScale2, vNoiseScale2);
        gl.uniform2fv(u2NoiseScale3, vNoiseScale3);
        gl.uniform2fv(u2CloudNoise, vCloudNoise);
        gl.uniform1f(u2Cloudiness, vCloudiness);
        gl.uniform3fv(u2Ocean, vOcean);
        gl.uniform3f(u2Ice, 250/255.0, 250/255.0, 250/255.0);
        gl.uniform3fv(u2Cold, vCold);//53/255.0, 102/255.0, 100/255.0);
        gl.uniform3fv(u2Temperate, vTemperate);//79/255.0, 109/255.0, 68/255.0);
        gl.uniform3fv(u2Warm, vWarm);//119/255.0, 141/255.0, 82/255.0);
        gl.uniform3fv(u2Hot, vHot);//223/255.0, 193/255.0, 148/255.0);
        gl.uniform3fv(u2Speckle, vSpeckle);
        gl.uniform3fv(u2Clouds, vClouds);
        gl.uniform3fv(u2Haze, vHaze);
        gl.uniform1f(u2WaterLevel, vWaterLevel);
        gl.uniform1f(u2Rivers, vRivers);
        gl.uniform1f(u2Temperature, vTemperature);

        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);    
    }

    // Creating a proxy of window.fxrand function for "catching" all ...
    // .. generated random values from each function call
    function rnd() {
        const handler = {
            apply: function (target, thisArg, argumentsList) {
                const randValue = target({ ...argumentsList });
                randGeneratedValues.push(randValue);

                return randValue;
            }
        };

        const randFunctionProxy = new Proxy(window.fxrand, handler);
        return randFunctionProxy();
    }

    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var t = new Date().getTime() % 1000000;

    var doRenderMap = false;

    function nextFrame() {
        t = new Date().getTime() % 1000000;
        if (doRenderMap) { renderMap(); } else { renderPlanet(); }
        requestAnimationFrame(nextFrame);
    }

    function doParse(text) {
        var struct = null;
        var value = null;
        text.split("\n").forEach(function(line) {
            var k = line.split(" ")[0];
            var v = line.substring(k.length + 1);
            if (k.length == 0 || v.length == 0) { return; }
            if (k == "struct") {
                value = null;
                struct = { slots: [], vals: {} };
                structs[v] = struct;
                return;
            }
            if (k == "slot") {
                struct.slots.push(v);
                if (!slots[v]) {
                    slots[v] = [];
                }
                return;
            }
            if (k == "blocker") {
                if (value === null || !value.blockers) {
                    value = {}
                    value.blockers = []
                }
                value.blockers.push([v.split(" ")[0], v.split(" ")[1]]);
                return;
            }
            if (slots[k]) {
                struct = null;
                value = {"id": v, "blockers": []};
                slots[k].push(value);
                return;
            }
            if (struct) {
                struct.vals[k] = v;
            } else {
                value[k] = v;
            }
        });
        console.log();
    }

    function genFromRandomID(id) {
        // Skipping 6 random numbers to match NFT render and data
        for (let i = 0; i < 6; i++) {
            rnd();
        };

        Math.seedrandom();
        genFromID(id);
    }

    function genFromID(genID) {
        Math.seedrandom(genID);
        console.log(genID);
        var result = doGen("planet")
        doDisplay(result);
    }

    function doGen(structID) {
        var result = {"struct": structs[structID]};
        structs[structID]?.slots.forEach(function(slot) {
            var availableSlots = slots[slot].filter(function(value) {
                return !value.blockers.some(function(blocker) {
                    var blockerSlot = blocker[0];
                    if (blockerSlot.indexOf(":") != -1) {
                        var blockerKey = blockerSlot.substring(blockerSlot.indexOf(":") + 1);
                        blockerSlot = blockerSlot.split(":")[0];
                        var blockerValue = blocker[1];
                        return result[blockerSlot] && result[blockerSlot][blockerKey] == blockerValue;
                    } else{
                        var blockerID = blocker[1];
                        return result[blockerSlot] && result[blockerSlot].id == blockerID;
                    }
                });
            });
            if (availableSlots.length == 0) {
                console.log(slot + " fail");
                console.log(result);
                availableSlots = slots[slot]; // qqDPS
            }
            result[slot] = availableSlots[Math.floor(rnd() * availableSlots.length)];
        });
        return result;
    }

    function doDisplay(result) {
        //jQuery("body").css("background-position", Math.ceil(rnd() * 2000) + "px " + Math.ceil(rnd() * 2000) + "px");
        /*jQuery("#c").
        css("top", (jQuery(window).innerHeight() / 2 - jQuery("#c").height() / 2) + "px").
        css("left", (jQuery(window).innerWidth() / 2 - jQuery("#c").width() / 2) + "px");*/
        //jQuery("#setID").html("ID: " + genID);
        // jQuery("#txt").html(doExpand(result.struct.vals["desc"], result));
        // jQuery("#stats").html(
        //     "Habitability: " + (Math.max(1, Math.min(9, eval(doExpand(result.struct.vals["hab"], result)))) * 10) + "%<br>" +
        //     "Size: " + (Math.max(1, Math.min(9, eval(doExpand(result.struct.vals["sze"], result))))) + "<br>" +
        //     "Industry: " + (Math.max(1, Math.min(9, eval(doExpand(result.struct.vals["min"], result))))) + "<br>" +
        //     "Science: " + (Math.max(1, Math.min(9, eval(doExpand(result.struct.vals["sci"], result)))))
        // );

        // Skipping 7 random numbers to match NFT render and data
        for (let i = 0; i < 7; i++) {
            rnd();
        };

        console.log(result);
        vWaterLevel = eval(doExpand(result.struct.vals["watL"], result));
        vTemperature = eval(doExpand(result.struct.vals["temp"], result));
        vRivers = eval(doExpand(result.struct.vals["rive"], result));
        vCold = eval(doExpand(result.struct.vals["coldC"], result));
        vOcean = eval(doExpand(result.struct.vals["oceanC"], result)) || [0.05, 0.22, 0.38];
        vTemperate = eval(doExpand(result.struct.vals["temperateC"], result));
        vWarm = eval(doExpand(result.struct.vals["warmC"], result));
        vHot = eval(doExpand(result.struct.vals["hotC"], result));
        vSpeckle = eval(doExpand(result.struct.vals["speckleC"], result));
        vLightColor = eval(doExpand(result.struct.vals["lightC"], result));
        vHaze = eval(doExpand(result.struct.vals["hazeC"], result)) || [0.15, 0.15, 0.2];
        
        vCloudiness = Math.min(1.5, Math.max(0, eval(doExpand(result.struct.vals["clouds"], result))));
        vClouds = eval(doExpand(result.struct.vals["cloudC"], result)) || [0.9, 0.9, 0.9];
        vAngle = 0.6 * rnd();
        vRotspeed = (0.005 + rnd() * 0.01) * (rnd() < 0.3 ? -1 : 1) * eval(doExpand(result.struct.vals["rotspeedMult"], result));;
        vLight = 4 * rnd();
        vZLight = 0.2 + rnd();
        vModValue = 17 + Math.ceil(rnd() * 20);
        vNoiseOffset = [Math.ceil(rnd() * 100), Math.ceil(rnd() * 100)];
        vNoiseScale = [6 + Math.ceil(rnd() * 8), 5 + Math.ceil(rnd() * 6)];
        var sc = 80 + Math.ceil(rnd() * 220);
        vNoiseScale2 = [sc, sc];
        sc = 20 + Math.ceil(rnd() * 80);
        vNoiseScale3 = [sc, sc];
        vCloudNoise = [4 + Math.ceil(rnd() * 9), 20 + Math.ceil(rnd() * 20)];

        // Generating planet data and reusing previously generated random...
        // .. values to match NFT data
        window.$fxhashFeatures = {
            "habitability": getHab(randGeneratedValues[47]) + "%",
            "size": getSize(randGeneratedValues[48]),
            "age": getHab(randGeneratedValues[49]) + "M years",
            "gravity": getGravity(randGeneratedValues[50]),
            "exoplanet": isExoplanet(randGeneratedValues[51])
        };
    }

    function doExpand(txt, context) {
        if (!txt) { return ""; }
        if (txt.indexOf("{") == -1) { return txt; }
        return txt.replace(/[{]([^}]*)[}]/g, function (m, capture) {
            if (capture.indexOf(":") == -1) {
                return context[capture].id;
            } else {
                var slot = capture.split(":")[0];
                var prop = capture.substring(slot.length + 1);
                return doExpand(context[slot][prop], context);
            }
        });
    }

    window.initPlanet = async (id, size) => {
        const response = await fetch('/assets/data.txt');
        const txt = await response.text();
        doParse(txt);
        genFromRandomID(id);
        renderPlanet(size);
        requestAnimationFrame(nextFrame);
    }

}