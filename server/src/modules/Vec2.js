// An object representing a 2D vector.
// Based on the Vector2 class from LibGDX.
// Written by Rahat Ahmed (http://rahatah.me/d).

const isNumber = n => typeof n === "number" && n === n; // NaN is not equal to itself

class Vec2 {
    constructor(x = 0, y = 0) {
        if (!isNumber(x) || !isNumber(y))
            throw new TypeError(`Cannot create Vec2 from non-number: ${x}, ${y}.`);
        this.x = x;
        this.y = y;
    }
    static fromAngle(angle) {
        if (!isNumber(angle))
            throw new TypeError(`Cannot create Vec2 from non-number: ${angle}.`);
        return new Vec2(Math.cos(angle), Math.sin(angle));
    }
    add(vecOrNum) {
        if (vecOrNum instanceof Vec2) {
            this.x += vecOrNum.x;
            this.y += vecOrNum.y;
        } else if (isNumber(vecOrNum)) {
            this.x += vecOrNum;
            this.y += vecOrNum;
        } else {
            throw new TypeError(`Tried to do math with ${vecOrNum}.`);
        }
        return this;
    }
    sum(vecOrNum) {
        if (vecOrNum instanceof Vec2) {
            return new Vec2(this.x + vecOrNum.x, this.y + vecOrNum.y);
        } else if (isNumber(vecOrNum)) {
            return new Vec2(this.x + vecOrNum, this.y + vecOrNum);
        } else {
            throw new TypeError(`Tried to do math with ${vecOrNum}.`);
        }
    }
    subtract(vecOrNum) {
        if (vecOrNum instanceof Vec2) {
            this.x -= vecOrNum.x;
            this.y -= vecOrNum.y;
        } else if (isNumber(vecOrNum)) {
            this.x -= vecOrNum;
            this.y -= vecOrNum;
        } else {
            throw new TypeError(`Tried to do math with ${vecOrNum}.`);
        }
        return this;
    }
    difference(vecOrNum) {
        if (vecOrNum instanceof Vec2) {
            return new Vec2(this.x - vecOrNum.x, this.y - vecOrNum.y);
        } else if (isNumber(vecOrNum)) {
            return new Vec2(this.x - vecOrNum, this.y - vecOrNum);
        } else {
            throw new TypeError(`Tried to do math with ${vecOrNum}.`);
        }
    }
    multiply(vecOrNum) {
        if (vecOrNum instanceof Vec2) {
            this.x *= vecOrNum.x;
            this.y *= vecOrNum.y;
        } else if (isNumber(vecOrNum)) {
            this.x *= vecOrNum;
            this.y *= vecOrNum;
        } else {
            throw new TypeError(`Tried to do math with ${vecOrNum}.`);
        }
        return this;
    }
    product(vecOrNum) {
        if (vecOrNum instanceof Vec2) {
            return new Vec2(this.x * vecOrNum.x, this.y * vecOrNum.y);
        } else if (isNumber(vecOrNum)) {
            return new Vec2(this.x * vecOrNum, this.y * vecOrNum);
        } else {
            throw new TypeError(`Tried to do math with ${vecOrNum}.`);
        }
    }
    divide(vecOrNum) {
        if (vecOrNum instanceof Vec2) {
            this.x /= vecOrNum.x;
            this.y /= vecOrNum.y;
        } else if (isNumber(vecOrNum)) {
            this.x /= vecOrNum;
            this.y /= vecOrNum;
        } else {
            throw new TypeError(`Tried to do math with ${vecOrNum}.`);
        }
        return this;
    }
    quotient(vecOrNum) {
        if (vecOrNum instanceof Vec2) {
            return new Vec2(this.x / vecOrNum.x, this.y / vecOrNum.y);
        } else if (isNumber(vecOrNum)) {
            return new Vec2(this.x / vecOrNum, this.y / vecOrNum);
        } else {
            throw new TypeError(`Tried to do math with ${vecOrNum}.`);
        }
    }
    assign(vecOrNum) {
        if (vecOrNum instanceof Vec2) {
            this.x = vecOrNum.x;
            this.y = vecOrNum.y;
        } else if (isNumber(vecOrNum)) {
            this.x = vecOrNum;
            this.y = vecOrNum;
        } else {
            throw new TypeError(`Tried to do math with ${vecOrNum}.`);
        }
        return this;
    }
    angle() {
        return Math.atan2(this.y, this.x); // Not a mistake, Math.atan2() takes y first
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    dist() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    distSquared() {
        return this.x * this.x + this.y * this.y;
    }
    normalize() {
        const dist = this.dist();
        if (dist === 0) return this;
        return this.multiply(1 / dist);
    }
}

module.exports = Vec2;
