"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./init");
const PromptTemplate_1 = __importDefault(require("./PromptTemplate"));
const string_format_1 = __importDefault(require("string-format"));
class PatPatBot {
    constructor(gpt, search) {
        this.gpt = gpt;
        this.search = search;
        this.promptTemplates = this.loadPromptTemplates();
        this.promptData = {};
    }
    setSourceDocData(docFileData) {
        this.promptData = docFileData.toDict();
    }
    processSourceDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const promptTemplate of this.promptTemplates) {
                if (promptTemplate.isSearch()) {
                    yield this.doSearch(promptTemplate);
                }
                else if (promptTemplate.isGpt) {
                    yield this.doPrompt(promptTemplate);
                }
            }
        });
    }
    getPromptData(promptId) {
        return this.promptData[promptId];
    }
    setPromptData(promptId, result) {
        this.promptData[promptId] = result;
    }
    doSearch(promptTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = (0, string_format_1.default)(promptTemplate.promptHuman, this.promptData);
            const result = yield this.search.execute(prompt);
            this.setPromptData(promptTemplate.id, result);
        });
    }
    doPrompt(promptTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.gpt.execute(promptTemplate.promptHuman, this.promptData, promptTemplate.promptSystem);
            this.setPromptData(promptTemplate.id, result);
        });
    }
    loadPromptTemplates() {
        return init_1.FILES_PROMPTS.map(filePath => PromptTemplate_1.default.fromFilePath(filePath));
    }
}
exports.default = PatPatBot;
