/*
 * Simple BinaryReader is a minimal tool to read binary stream.
 * Useful for binary deserialization.
 *
 * Copyright (c) 2016 Barbosik
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class BinaryReader {
    constructor(buffer) {
        this._offset = 0;
        this._buffer = Buffer.from(buffer);
    }
    readUInt8() {
        let value = this._buffer.readUInt8(this._offset);
        this._offset++;

        return value;
    }
    readInt8() {
        let value = this._buffer.readInt8(this._offset);
        this._offset++;

        return value;
    }
    readUInt16() {
        let value = this._buffer.readUInt16LE(this._offset);
        this._offset += 2;

        return value;
    }
    readInt16() {
        let value = this._buffer.readInt16LE(this._offset);
        this._offset += 2;

        return value;
    }
    readUInt32() {
        let value = this._buffer.readUInt32LE(this._offset);
        this._offset += 4;

        return value;
    }
    readInt32() {
        let value = this._buffer.readInt32LE(this._offset);
        this._offset += 4;

        return value;
    }
    readFloat() {
        let value = this._buffer.readFloatLE(this._offset);
        this._offset += 4;

        return value;
    }
    readDouble() {
        let value = this._buffer.readDoubleLE(this._offset);
        this._offset += 8;

        return value;
    }
    readBytes(length) {
        return this._buffer.slice(this._offset, this._offset + length);
        this._offset += length;
    }
    skipBytes(length) {
        this._offset += length;
    }
    readStringUtf8(length) {
        if (length == null)
            length = this._buffer.length - this._offset;

        length = Math.max(0, length);

        let value = this._buffer.toString('utf8', this._offset, this._offset + length);
        this._offset += length;

        return value;
    }
    readStringUnicode(length) {
        if (length == null)
            length = this._buffer.length - this._offset;

        length = Math.max(0, length);

        let safeLength = length - (length % 2);
        safeLength = Math.max(0, safeLength);

        let value = this._buffer.toString('ucs2', this._offset, this._offset + safeLength);
        this._offset += length;

        return value;
    }
    readStringZeroUtf8() {
        let length = 0;
        let terminatorLength = 0;

        for (let i = this._offset; i < this._buffer.length; i++) {
            if (this._buffer.readUInt8(i) == 0) {
                terminatorLength = 1;
                break;
            }
            length++;
        }

        let value = this.readStringUtf8(length);
        this._offset += terminatorLength;

        return value;
    }
    readStringZeroUnicode() {
        let length = 0;

        let terminatorLength = ((this._buffer.length - this._offset) & 1) != 0 ? 1 : 0;
        for (let i = this._offset; i + 1 < this._buffer.length; i += 2) {
            if (this._buffer.readUInt16LE(i) == 0) {
                terminatorLength = 2;
                break;
            }
            length += 2;
        }

        let value = this.readStringUnicode(length);
        this._offset += terminatorLength;

        return value;
    }
}

module.exports = BinaryReader;
