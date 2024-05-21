"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DocFileData {
    constructor(tool, path, patternFilename, patternDescription) {
        this.tool = tool;
        this.path = path;
        this.patternFilename = patternFilename;
        this.patternDescription = patternDescription;
    }
    toDict(keyPrefix = "init__") {
        const output = {};
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                const snakeCaseKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                output[keyPrefix + snakeCaseKey] = this[key];
            }
        }
        return output;
    }
}
exports.default = DocFileData;
