"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snakeCase = (str) => str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
class DocumentationFile {
    constructor(fileData, keyPrefix = "init__") {
        this.fileData = Object.entries(fileData).reduce((acc, [key, value]) => {
            acc[keyPrefix + snakeCase(key)] = value;
            return acc;
        }, {});
    }
    get data() {
        return this.fileData;
    }
}
exports.default = DocumentationFile;
