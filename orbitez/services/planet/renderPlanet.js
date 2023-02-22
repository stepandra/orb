import { getFxRandGenForHash } from "./fxhash";
import vertexShaderSource from "./shaders/vertexShaderSource";
import fragmentShaderSource from "./shaders/fragmentShaderSource";
import createShader from "./infra/createShader";
import createProgram from "./infra/createProgram";
import planetStruct from "./infra/planetStruct";

const renderPlanet = (id, canvasRef, size) => {
    const canvas = canvasRef.current;
    let structs = {};
    let slots = {};

    const fxRandForPlanetHash = getFxRandGenForHash(id);

    function resize(canvas) {
        // Lookup the size the browser is displaying the canvas.
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        // Check if the canvas is not the same size.
        if (canvas.width != displayWidth || canvas.height != displayHeight) {
            // Make the canvas the same size
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
    }

    const gl = canvas.getContext("webgl", {
        preserveDrawingBuffer: true,
        premultipliedAlpha: false
    });
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    const uCities = gl.getUniformLocation(program, "cities");
    const uTime = gl.getUniformLocation(program, "time");
    const uLeft = gl.getUniformLocation(program, "left");
    const uTop = gl.getUniformLocation(program, "top");
    const uResolution = gl.getUniformLocation(program, "resolution");
    const uAngle = gl.getUniformLocation(program, "angle");
    const uRotspeed = gl.getUniformLocation(program, "rotspeed");
    const uLight = gl.getUniformLocation(program, "light");
    const uZLight = gl.getUniformLocation(program, "zLight");
    const uLightColor = gl.getUniformLocation(program, "lightColor");
    const uModValue = gl.getUniformLocation(program, "modValue");
    const uNoiseOffset = gl.getUniformLocation(program, "noiseOffset");
    const uNoiseScale = gl.getUniformLocation(program, "noiseScale");
    const uNoiseScale2 = gl.getUniformLocation(program, "noiseScale2");
    const uNoiseScale3 = gl.getUniformLocation(program, "noiseScale3");
    const uCloudNoise = gl.getUniformLocation(program, "cloudNoise");
    const uCloudiness = gl.getUniformLocation(program, "cloudiness");
    const uOcean = gl.getUniformLocation(program, "ocean");
    const uIce = gl.getUniformLocation(program, "ice");
    const uCold = gl.getUniformLocation(program, "cold");
    const uTemperate = gl.getUniformLocation(program, "temperate");
    const uWarm = gl.getUniformLocation(program, "warm");
    const uHot = gl.getUniformLocation(program, "hot");
    const uSpeckle = gl.getUniformLocation(program, "speckle");
    const uClouds = gl.getUniformLocation(program, "clouds");
    const uWaterLevel = gl.getUniformLocation(program, "waterLevel");
    const uRivers = gl.getUniformLocation(program, "rivers");
    const uTemperature = gl.getUniformLocation(program, "temperature");
    const uHaze = gl.getUniformLocation(program, "haze");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // three 2d points
    const positions = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    let vWaterLevel = 0;
    let vRivers = 0;
    let vTemperature = 0;
    let vCold = [0.5, 0.5, 0.5];
    let vOcean = [0.5, 0.5, 0.5];
    let vTemperate = [0.5, 0.5, 0.5];
    let vWarm = [0.5, 0.5, 0.5];
    let vHot = [0.5, 0.5, 0.5];
    let vSpeckle = [0.5, 0.5, 0.5];
    let vClouds = [0.9, 0.9, 0.9];
    let vCloudiness = 0.35;
    let vLightColor = [1.0, 1.0, 1.0];
    let vHaze = [0.15, 0.15, 0.2];

    let vAngle = 0.3;
    let vRotspeed = 0.01;
    let vLight = 1.9;
    let vZLight = 0.5;
    let vModValue = 29;
    let vNoiseOffset = [0, 0];
    let vNoiseScale = [11, 8];
    let vNoiseScale2 = [200, 200];
    let vNoiseScale3 = [50, 50];
    let vCloudNoise = [6, 30];

    function renderPlanet(sz) {
        const htmlElHeight = document.documentElement.clientHeight;
        const htmlElWidth = document.documentElement.clientWidth;
        sz = Math.min(
            (htmlElWidth - 960) * 0.65 - (htmlElHeight - 960) * 0.02,
            415
        ); // || Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.40);

        const canvasHeight = canvas.getBoundingClientRect().height;
        const canvasWidth = canvas.getBoundingClientRect().width;

        // Apply calculated styles
        canvas.style.width = sz + "px";
        canvas.style.height = sz + "px";
        canvas.style.top = htmlElHeight / 2 - canvasHeight / 2 + "px";
        canvas.style.left = htmlElWidth / 2 - canvasWidth / 2 + "px";

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
        const size = 2; // 2 components per iteration
        const type = gl.FLOAT; // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0; // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation,
            size,
            type,
            normalize,
            stride,
            offset
        );

        gl.uniform1i(uCities, 0);
        gl.uniform1f(uTime, t * 0.001); // qqDPS
        const shift = Math.round(sz / 40);
        gl.uniform1f(uLeft, -shift);
        gl.uniform1f(uTop, -shift);
        const res = Math.round(sz * 0.95);
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
        gl.uniform3f(uIce, 250 / 255.0, 250 / 255.0, 250 / 255.0);
        gl.uniform3fv(uCold, vCold); //53/255.0, 102/255.0, 100/255.0);
        gl.uniform3fv(uTemperate, vTemperate); //79/255.0, 109/255.0, 68/255.0);
        gl.uniform3fv(uWarm, vWarm); //119/255.0, 141/255.0, 82/255.0);
        gl.uniform3fv(uHot, vHot); //223/255.0, 193/255.0, 148/255.0);
        gl.uniform3fv(uSpeckle, vSpeckle);
        gl.uniform3fv(uClouds, vClouds);
        gl.uniform3fv(uHaze, vHaze);
        gl.uniform1f(uWaterLevel, vWaterLevel);
        gl.uniform1f(uRivers, vRivers);
        gl.uniform1f(uTemperature, vTemperature);

        const primitiveType = gl.TRIANGLES;
        const drawArraysOffset = 0;
        const count = 6;
        gl.drawArrays(primitiveType, drawArraysOffset, count);
    }

    const requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;
    let t = new Date().getTime() % 1000000;

    function nextFrame() {
        t = new Date().getTime() % 1000000;
        renderPlanet();
        requestAnimationFrame(nextFrame);
    }

    function doParse(text) {
        let struct = null;
        let value = null;
        text.split("\n").forEach(function (line) {
            const k = line.split(" ")[0];
            const v = line.substring(k.length + 1);
            if (k.length == 0 || v.length == 0) {
                return;
            }
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
                    value = {};
                    value.blockers = [];
                }
                value.blockers.push([v.split(" ")[0], v.split(" ")[1]]);
                return;
            }
            if (slots[k]) {
                struct = null;
                value = { id: v, blockers: [] };
                slots[k].push(value);
                return;
            }
            if (struct) {
                struct.vals[k] = v;
            } else {
                value[k] = v;
            }
        });
    }

    function genFromRandomID(id) {
        // Skipping 6 random numbers to match NFT render and data
        for (let i = 0; i < 6; i++) {
            fxRandForPlanetHash();
        }

        const result = doGen("planet");
        doDisplay(result);
    }

    function doGen(structID) {
        let result = { struct: structs[structID] };
        structs[structID]?.slots.forEach(function (slot) {
            let availableSlots = slots[slot].filter(function (value) {
                return !value.blockers.some(function (blocker) {
                    let blockerSlot = blocker[0];
                    if (blockerSlot.indexOf(":") != -1) {
                        const blockerKey = blockerSlot.substring(
                            blockerSlot.indexOf(":") + 1
                        );
                        blockerSlot = blockerSlot.split(":")[0];
                        const blockerValue = blocker[1];
                        return (
                            result[blockerSlot] &&
                            result[blockerSlot][blockerKey] == blockerValue
                        );
                    } else {
                        const blockerID = blocker[1];
                        return (
                            result[blockerSlot] &&
                            result[blockerSlot].id == blockerID
                        );
                    }
                });
            });
            if (availableSlots.length == 0) {
                console.log(slot + " fail");
                availableSlots = slots[slot]; // qqDPS
            }
            result[slot] =
                availableSlots[Math.floor(fxRandForPlanetHash() * availableSlots.length)];
        });
        return result;
    }

    function doDisplay(result) {
        // Skipping 7 random numbers to match NFT render and data
        for (let i = 0; i < 7; i++) {
            fxRandForPlanetHash();
        }

        vWaterLevel = eval(doExpand(result.struct.vals["watL"], result));
        vTemperature = eval(doExpand(result.struct.vals["temp"], result));
        vRivers = eval(doExpand(result.struct.vals["rive"], result));
        vCold = eval(doExpand(result.struct.vals["coldC"], result));
        vOcean = eval(doExpand(result.struct.vals["oceanC"], result)) || [
            0.05, 0.22, 0.38
        ];
        vTemperate = eval(doExpand(result.struct.vals["temperateC"], result));
        vWarm = eval(doExpand(result.struct.vals["warmC"], result));
        vHot = eval(doExpand(result.struct.vals["hotC"], result));
        vSpeckle = eval(doExpand(result.struct.vals["speckleC"], result));
        vLightColor = eval(doExpand(result.struct.vals["lightC"], result));
        vHaze = eval(doExpand(result.struct.vals["hazeC"], result)) || [
            0.15, 0.15, 0.2
        ];

        vCloudiness = Math.min(
            1.5,
            Math.max(0, eval(doExpand(result.struct.vals["clouds"], result)))
        );
        vClouds = eval(doExpand(result.struct.vals["cloudC"], result)) || [
            0.9, 0.9, 0.9
        ];
        vAngle = 0.6 * fxRandForPlanetHash();
        vRotspeed =
            (0.005 + fxRandForPlanetHash() * 0.01) *
            (fxRandForPlanetHash() < 0.3 ? -1 : 1) *
            eval(doExpand(result.struct.vals["rotspeedMult"], result));
        vLight = 4 * fxRandForPlanetHash();
        vZLight = 0.2 + fxRandForPlanetHash();
        vModValue = 17 + Math.ceil(fxRandForPlanetHash() * 20);
        vNoiseOffset = [Math.ceil(fxRandForPlanetHash() * 100), Math.ceil(fxRandForPlanetHash() * 100)];
        vNoiseScale = [6 + Math.ceil(fxRandForPlanetHash() * 8), 5 + Math.ceil(fxRandForPlanetHash() * 6)];
        let sc = 80 + Math.ceil(fxRandForPlanetHash() * 220);
        vNoiseScale2 = [sc, sc];
        sc = 20 + Math.ceil(fxRandForPlanetHash() * 80);
        vNoiseScale3 = [sc, sc];
        vCloudNoise = [4 + Math.ceil(fxRandForPlanetHash() * 9), 20 + Math.ceil(fxRandForPlanetHash() * 20)];
    }

    function doExpand(txt, context) {
        if (!txt) {
            return "";
        }
        if (txt.indexOf("{") == -1) {
            return txt;
        }
        return txt.replace(/[{]([^}]*)[}]/g, function (m, capture) {
            if (capture.indexOf(":") == -1) {
                return context[capture].id;
            } else {
                const slot = capture.split(":")[0];
                const prop = capture.substring(slot.length + 1);
                return doExpand(context[slot][prop], context);
            }
        });
    };
    
    doParse(planetStruct);
    genFromRandomID(id);
    renderPlanet(size);
    requestAnimationFrame(nextFrame);
}

export default renderPlanet;
