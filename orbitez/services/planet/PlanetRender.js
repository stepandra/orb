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
        this.#initWebGl();
    };

    #nextFrame(...renderParams) {
        if (!this.isAnimationRunning) return;
        
        this.currentFrameTimestamp = new Date().getTime();
        this.#render(...renderParams);
        requestAnimationFrame(() => this.#nextFrame());
    }

    initAnimation(...renderParams) {
        this.isAnimationRunning = true;
        this.currentFrameTimestamp = new Date().getTime();
        this.#render(...renderParams);
        requestAnimationFrame(() => this.#nextFrame(...renderParams));
    }

    stopAnimation() {
        this.isAnimationRunning = false;
    };

    getCurrentFrame(size, speed, background) {
        if (this.currentFrameTimestamp + 100 < new Date().getTime()) {
            this.currentFrameTimestamp = new Date().getTime();
            this.#render(size, speed, background);
        };

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

    #initWebGl() {
        this.gl = this.workingCanvas.getContext("webgl", {
            preserveDrawingBuffer: true,
            premultipliedAlpha: false
        });
        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = createProgram(this.gl, vertexShader, fragmentShader);

        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    
        this.uBackground = this.gl.getUniformLocation(this.program, "background");
        this.uCities = this.gl.getUniformLocation(this.program, "cities");
        this.uTime = this.gl.getUniformLocation(this.program, "time");
        this.uLeft = this.gl.getUniformLocation(this.program, "left");
        this.uTop = this.gl.getUniformLocation(this.program, "top");
        this.uResolution = this.gl.getUniformLocation(this.program, "resolution");
        this.uAngle = this.gl.getUniformLocation(this.program, "angle");
        this.uRotspeed = this.gl.getUniformLocation(this.program, "rotspeed");
        this.uLight = this.gl.getUniformLocation(this.program, "light");
        this.uZLight = this.gl.getUniformLocation(this.program, "zLight");
        this.uLightColor = this.gl.getUniformLocation(this.program, "lightColor");
        this.uModValue = this.gl.getUniformLocation(this.program, "modValue");
        this.uNoiseOffset = this.gl.getUniformLocation(this.program, "noiseOffset");
        this.uNoiseScale = this.gl.getUniformLocation(this.program, "noiseScale");
        this.uNoiseScale2 = this.gl.getUniformLocation(this.program, "noiseScale2");
        this.uNoiseScale3 = this.gl.getUniformLocation(this.program, "noiseScale3");
        this.uCloudNoise = this.gl.getUniformLocation(this.program, "cloudNoise");
        this.uCloudiness = this.gl.getUniformLocation(this.program, "cloudiness");
        this.uOcean = this.gl.getUniformLocation(this.program, "ocean");
        this.uIce = this.gl.getUniformLocation(this.program, "ice");
        this.uCold = this.gl.getUniformLocation(this.program, "cold");
        this.uTemperate = this.gl.getUniformLocation(this.program, "temperate");
        this.uWarm = this.gl.getUniformLocation(this.program, "warm");
        this.uHot = this.gl.getUniformLocation(this.program, "hot");
        this.uSpeckle = this.gl.getUniformLocation(this.program, "speckle");
        this.uClouds = this.gl.getUniformLocation(this.program, "clouds");
        this.uWaterLevel = this.gl.getUniformLocation(this.program, "waterLevel");
        this.uRivers = this.gl.getUniformLocation(this.program, "rivers");
        this.uTemperature = this.gl.getUniformLocation(this.program, "temperature");
        this.uHaze = this.gl.getUniformLocation(this.program, "haze");
    }

    #render(sz, speed = 1, background = true) {
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        // three 2d points
        const positions = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

        // If size parameter was not provided - calculating responsive size
        if (!sz) {
            const { width: htmlElWidth, height: htmlElHeight } = document.documentElement.getBoundingClientRect();

            sz = Math.min(
                (htmlElWidth - 960) * 0.62 - (htmlElHeight - 960) * 0.02,
                415
            );
        };

        // Apply calculated styles
        this.workingCanvas.height = sz;
        this.workingCanvas.width = sz;
        this.workingCanvas.style.width = sz + "px";
        this.workingCanvas.style.height = sz + "px";

        if (!sz) {
            // Resize canvas
            this.#resize(this.gl.canvas);
        }
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // Clear the canvas
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        // Tell it to use our this.program (pair of shaders)
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 2; // 2 components per iteration
        const type = this.gl.FLOAT; // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0; // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            this.positionAttributeLocation,
            size,
            type,
            normalize,
            stride,
            offset
        );

        this.gl.uniform1i(this.uBackground, background ? 1 : 0);
        this.gl.uniform1i(this.uCities, 0);
        this.gl.uniform1f(this.uTime, this.currentFrameTimestamp % 1000000 * 0.001 * speed); // qqDPS
        const shift = Math.round(sz / 40);
        this.gl.uniform1f(this.uLeft, -shift);
        this.gl.uniform1f(this.uTop, -shift);
        const res = Math.round(sz * 0.95);
        this.gl.uniform2f(this.uResolution, res, res);
        this.gl.uniform1f(this.uAngle, this.planetParams.vAngle);
        this.gl.uniform1f(this.uRotspeed, this.planetParams.vRotspeed);
        this.gl.uniform1f(this.uLight, this.planetParams.vLight);
        this.gl.uniform1f(this.uZLight, this.planetParams.vZLight);
        this.gl.uniform3fv(this.uLightColor, this.planetParams.vLightColor);
        this.gl.uniform1f(this.uModValue, this.planetParams.vModValue);
        this.gl.uniform2fv(this.uNoiseOffset, this.planetParams.vNoiseOffset);
        this.gl.uniform2fv(this.uNoiseScale, this.planetParams.vNoiseScale);
        this.gl.uniform2fv(this.uNoiseScale2, this.planetParams.vNoiseScale2);
        this.gl.uniform2fv(this.uNoiseScale3, this.planetParams.vNoiseScale3);
        this.gl.uniform2fv(this.uCloudNoise, this.planetParams.vCloudNoise);
        this.gl.uniform1f(this.uCloudiness, this.planetParams.vCloudiness);
        this.gl.uniform3fv(this.uOcean, this.planetParams.vOcean);
        this.gl.uniform3f(this.uIce, 250 / 255.0, 250 / 255.0, 250 / 255.0);
        this.gl.uniform3fv(this.uCold, this.planetParams.vCold); //53/255.0, 102/255.0, 100/255.0);
        this.gl.uniform3fv(this.uTemperate, this.planetParams.vTemperate); //79/255.0, 109/255.0, 68/255.0);
        this.gl.uniform3fv(this.uWarm, this.planetParams.vWarm); //119/255.0, 141/255.0, 82/255.0);
        this.gl.uniform3fv(this.uHot, this.planetParams.vHot); //223/255.0, 193/255.0, 148/255.0);
        this.gl.uniform3fv(this.uSpeckle, this.planetParams.vSpeckle);
        this.gl.uniform3fv(this.uClouds, this.planetParams.vClouds);
        this.gl.uniform3fv(this.uHaze, this.planetParams.vHaze);
        this.gl.uniform1f(this.uWaterLevel, this.planetParams.vWaterLevel);
        this.gl.uniform1f(this.uRivers, this.planetParams.vRivers);
        this.gl.uniform1f(this.uTemperature, this.planetParams.vTemperature);

        const primitiveType = this.gl.TRIANGLES;
        const drawArraysOffset = 0;
        const count = 6;
        this.gl.drawArrays(primitiveType, drawArraysOffset, count);
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
