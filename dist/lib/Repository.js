"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const glob_1 = require("glob");
const DocumentationFile_1 = __importDefault(require("./DocumentationFile"));
class Repository {
    constructor(name, docsGlob, replaceName = "codacy-") {
        this.name = replaceName ? name.replace(replaceName, "") : name;
        this.docFileData = this.loadDocFileData(docsGlob);
    }
    get docs() {
        return this.docFileData;
    }
    loadDocFileData(docFilePaths) {
        return (0, glob_1.globSync)(docFilePaths).map(docFilePath => new DocumentationFile_1.default({
            tool: this.name,
            path: docFilePath,
            patternFilename: (0, path_1.basename)(docFilePath),
            patternDescription: (0, fs_1.readFileSync)(docFilePath, 'utf-8')
        }));
    }
}
exports.default = Repository;
