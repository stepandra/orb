import { getFxRandGenForHash } from "./fxhash";
import vertexShaderSource from "./shaders/vertexShaderSource";
import fragmentShaderSource from "./shaders/fragmentShaderSource";
import createShader from "./infra/createShader";
import createProgram from "./infra/createProgram";
import planetStruct from "./infra/planetStruct";

class PlanetRender {
    static #getWorkingCanvas(canvasRef) {
        if (canvasRef?.current) {
            return canvasRef.current
        };
        return document.createElement("canvas");
    };

    constructor(planetHash, canvasRef) {
        this.workingCanvas = PlanetRender.#getWorkingCanvas(canvasRef);
        this.isAnimationRunning = false;
        this.structs = {};
        this.slots = {};
        this.fxRandForPlanetHash = getFxRandGenForHash(planetHash);
        this.planetParams = {
            vWaterLevel: 0,
            vRivers: 0,
            vTemperature: 0,
            vCold: [0.5, 0.5, 0.5],
            vOcean: [0.5, 0.5, 0.5],
            vTemperate: [0.5, 0.5, 0.5],
            vWarm: [0.5, 0.5, 0.5],
            vHot: [0.5, 0.5, 0.5],
            vSpeckle: [0.5, 0.5, 0.5],
            vClouds: [0.9, 0.9, 0.9],
            vCloudiness: 0.35,
            vLightColor: [1.0, 1.0, 1.0],
            vHaze: [0.15, 0.15, 0.2],
            vRotspeed: 0.01,
            vAngle: 0.3,
            vLight: 1.9,
            vZLight: 0.5,
            vModValue: 29,
            vNoiseOffset: [0, 0],
            vNoiseScale: [11, 8],
            vNoiseScale2: [200, 200],
            vNoiseScale3: [50, 50],
            vCloudNoise: [6, 30]
        };
        this.currentFrameTimestamp = null;
        
        this.#doParse(planetStruct);
        this.#doDisplay();
    };

    #nextFrame() {
        if (!this.isAnimationRunning) return;
        
        this.currentFrameTimestamp = new Date().getTime();
        this.#render();
        requestAnimationFrame(() => this.#nextFrame());
    }

    initAnimation(size) {
        this.isAnimationRunning = true;
        this.currentFrameTimestamp = new Date().getTime();
        this.#render(size);
        requestAnimationFrame(() => this.#nextFrame());
    }

    stopAnimation() {
        this.isAnimationRunning = false;
    };

    getCurrentFrame(size) {
        this.currentFrameTimestamp = new Date().getTime();
        this.#render(size);

        return this.workingCanvas;
    };

    #resize(canvas) {
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

    #render(sz) {
        const gl = this.workingCanvas.getContext("webgl", {
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

        const htmlElHeight = document.documentElement.clientHeight;
        const htmlElWidth = document.documentElement.clientWidth;
        sz = Math.min(
            (htmlElWidth - 960) * 0.65 - (htmlElHeight - 960) * 0.02,
            415
        ); // || Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.40);

        const canvasHeight = this.workingCanvas.getBoundingClientRect().height;
        const canvasWidth = this.workingCanvas.getBoundingClientRect().width;

        // Apply calculated styles
        this.workingCanvas.style.width = sz + "px";
        this.workingCanvas.style.height = sz + "px";
        this.workingCanvas.style.top = htmlElHeight / 2 - canvasHeight / 2 + "px";
        this.workingCanvas.style.left = htmlElWidth / 2 - canvasWidth / 2 + "px";

        // Resize canvas
        this.#resize(gl.canvas);
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
        gl.uniform1f(uTime, this.currentFrameTimestamp % 1000000 * 0.001); // qqDPS
        const shift = Math.round(sz / 40);
        gl.uniform1f(uLeft, -shift);
        gl.uniform1f(uTop, -shift);
        const res = Math.round(sz * 0.95);
        gl.uniform2f(uResolution, res, res);
        gl.uniform1f(uAngle, this.planetParams.vAngle);
        gl.uniform1f(uRotspeed, this.planetParams.vRotspeed);
        gl.uniform1f(uLight, this.planetParams.vLight);
        gl.uniform1f(uZLight, this.planetParams.vZLight);
        gl.uniform3fv(uLightColor, this.planetParams.vLightColor);
        gl.uniform1f(uModValue, this.planetParams.vModValue);
        gl.uniform2fv(uNoiseOffset, this.planetParams.vNoiseOffset);
        gl.uniform2fv(uNoiseScale, this.planetParams.vNoiseScale);
        gl.uniform2fv(uNoiseScale2, this.planetParams.vNoiseScale2);
        gl.uniform2fv(uNoiseScale3, this.planetParams.vNoiseScale3);
        gl.uniform2fv(uCloudNoise, this.planetParams.vCloudNoise);
        gl.uniform1f(uCloudiness, this.planetParams.vCloudiness);
        gl.uniform3fv(uOcean, this.planetParams.vOcean);
        gl.uniform3f(uIce, 250 / 255.0, 250 / 255.0, 250 / 255.0);
        gl.uniform3fv(uCold, this.planetParams.vCold); //53/255.0, 102/255.0, 100/255.0);
        gl.uniform3fv(uTemperate, this.planetParams.vTemperate); //79/255.0, 109/255.0, 68/255.0);
        gl.uniform3fv(uWarm, this.planetParams.vWarm); //119/255.0, 141/255.0, 82/255.0);
        gl.uniform3fv(uHot, this.planetParams.vHot); //223/255.0, 193/255.0, 148/255.0);
        gl.uniform3fv(uSpeckle, this.planetParams.vSpeckle);
        gl.uniform3fv(uClouds, this.planetParams.vClouds);
        gl.uniform3fv(uHaze, this.planetParams.vHaze);
        gl.uniform1f(uWaterLevel, this.planetParams.vWaterLevel);
        gl.uniform1f(uRivers, this.planetParams.vRivers);
        gl.uniform1f(uTemperature, this.planetParams.vTemperature);

        const primitiveType = gl.TRIANGLES;
        const drawArraysOffset = 0;
        const count = 6;
        gl.drawArrays(primitiveType, drawArraysOffset, count);
    };

    #doParse(text) {
        let struct = null;
        let value = null;
        text.split("\n").forEach((line) => {
            const k = line.split(" ")[0];
            const v = line.substring(k.length + 1);
            if (k.length == 0 || v.length == 0) {
                return;
            }
            if (k == "struct") {
                value = null;
                struct = { slots: [], vals: {} };
                this.structs[v] = struct;
                return;
            }
            if (k == "slot") {
                struct.slots.push(v);
                if (!this.slots[v]) {
                    this.slots[v] = [];
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
            if (this.slots[k]) {
                struct = null;
                value = { id: v, blockers: [] };
                this.slots[k].push(value);
                return;
            }
            if (struct) {
                struct.vals[k] = v;
            } else {
                value[k] = v;
            }
        });
    };

    #doGen(structID) {
        // Skipping 6 random numbers to match NFT render and data
        for (let i = 0; i < 6; i++) {
            this.fxRandForPlanetHash();
        };

        let result = { struct: this.structs[structID] };
        this.structs[structID]?.slots.forEach((slot) => {
            let availableSlots = this.slots[slot].filter((value) => {
                return !value.blockers.some((blocker) => {
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
                availableSlots = this.slots[slot]; // qqDPS
            }
            result[slot] =
                availableSlots[Math.floor(this.fxRandForPlanetHash() * availableSlots.length)];
        });
        return result;
    };

    #doDisplay() {
        const result = this.#doGen("planet");

        // Skipping 7 random numbers to match NFT render and data
        for (let i = 0; i < 7; i++) {
            this.fxRandForPlanetHash();
        }

        this.planetParams.vWaterLevel = eval(this.#doExpand(result.struct.vals["watL"], result));
        this.planetParams.vTemperature = eval(this.#doExpand(result.struct.vals["temp"], result));
        this.planetParams.vRivers = eval(this.#doExpand(result.struct.vals["rive"], result));
        this.planetParams.vCold = eval(this.#doExpand(result.struct.vals["coldC"], result));
        this.planetParams.vOcean = eval(this.#doExpand(result.struct.vals["oceanC"], result)) || [
            0.05, 0.22, 0.38
        ];
        this.planetParams.vTemperate = eval(this.#doExpand(result.struct.vals["temperateC"], result));
        this.planetParams.vWarm = eval(this.#doExpand(result.struct.vals["warmC"], result));
        this.planetParams.vHot = eval(this.#doExpand(result.struct.vals["hotC"], result));
        this.planetParams.vSpeckle = eval(this.#doExpand(result.struct.vals["speckleC"], result));
        this.planetParams.vLightColor = eval(this.#doExpand(result.struct.vals["lightC"], result));
        this.planetParams.vHaze = eval(this.#doExpand(result.struct.vals["hazeC"], result)) || [
            0.15, 0.15, 0.2
        ];

        this.planetParams.vCloudiness = Math.min(
            1.5,
            Math.max(0, eval(this.#doExpand(result.struct.vals["clouds"], result)))
        );
        this.planetParams.vClouds = eval(this.#doExpand(result.struct.vals["cloudC"], result)) || [
            0.9, 0.9, 0.9
        ];
        this.planetParams.vAngle = 0.6 * this.fxRandForPlanetHash();
        this.planetParams.vRotspeed =
            (0.005 + this.fxRandForPlanetHash() * 0.01) *
            (this.fxRandForPlanetHash() < 0.3 ? -1 : 1) *
            eval(this.#doExpand(result.struct.vals["rotspeedMult"], result));
            this.planetParams.vLight = 4 * this.fxRandForPlanetHash();
            this.planetParams.vZLight = 0.2 + this.fxRandForPlanetHash();
            this.planetParams.vModValue = 17 + Math.ceil(this.fxRandForPlanetHash() * 20);
            this.planetParams.vNoiseOffset = [Math.ceil(this.fxRandForPlanetHash() * 100), Math.ceil(this.fxRandForPlanetHash() * 100)];
            this.planetParams.vNoiseScale = [6 + Math.ceil(this.fxRandForPlanetHash() * 8), 5 + Math.ceil(this.fxRandForPlanetHash() * 6)];
        let sc = 80 + Math.ceil(this.fxRandForPlanetHash() * 220);
        this.planetParams.vNoiseScale2 = [sc, sc];
        sc = 20 + Math.ceil(this.fxRandForPlanetHash() * 80);
        this.planetParams.vNoiseScale3 = [sc, sc];
        this.planetParams.vCloudNoise = [4 + Math.ceil(this.fxRandForPlanetHash() * 9), 20 + Math.ceil(this.fxRandForPlanetHash() * 20)];
    };

    #doExpand(txt, context) {
        if (!txt) {
            return "";
        }
        if (txt.indexOf("{") == -1) {
            return txt;
        }
        return txt.replace(/[{]([^}]*)[}]/g, (m, capture) => {
            if (capture.indexOf(":") == -1) {
                return context[capture].id;
            } else {
                const slot = capture.split(":")[0];
                const prop = capture.substring(slot.length + 1);
                return this.#doExpand(context[slot][prop], context);
            }
        });
    };
}

export default PlanetRender;
