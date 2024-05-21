"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const glob_1 = require("glob");
const DocFileData_1 = __importDefault(require("./DocFileData"));
class Repository {
    constructor(name, docsGlob, replaceName = "codacy-") {
        this.name = replaceName ? name.replace(replaceName, "") : name;
        this.docFileData = this.loadDocFileData(docsGlob);
    }
    get docs() {
        return this.docFileData;
    }
    static fromSettings(name, docsGlob) {
        return new Repository(name, docsGlob);
    }
    loadDocFileData(docsGlob) {
        return (0, glob_1.globSync)(docsGlob).map(doc => new DocFileData_1.default(this.name, doc, (0, path_1.basename)(doc), (0, fs_1.readFileSync)(doc, 'utf-8')));
    }
    static repoNameFromUrl(url) {
        const match = url.match(/.*\/(.*)\.git/);
        return match ? match[1] : '';
    }
}
exports.default = Repository;
