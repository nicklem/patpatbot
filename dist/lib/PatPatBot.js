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
class PatPatBot {
    constructor(gpt, search) {
        this.gpt = gpt;
        this.search = search;
        this.promptData = {};
        this.promptTemplates = init_1.PATHS_PROMPTS.map(PromptTemplate_1.default.load);
    }
    setSourceDocData(docFileData) {
        this.promptData = docFileData.data;
    }
    processSourceDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const promptTemplate of this.promptTemplates) {
                switch (promptTemplate.tool) {
                    case 'google':
                        yield this.doSearch(promptTemplate);
                        break;
                    case 'gpt':
                        yield this.doPrompt(promptTemplate);
                        break;
                }
            }
        });
    }
    getPromptDatum(promptId) {
        return this.promptData[promptId];
    }
    doSearch(promptTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            this.promptData[promptTemplate.id] = yield this.search.execute(promptTemplate.promptHuman, this.promptData);
        });
    }
    doPrompt(promptTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            this.promptData[promptTemplate.id] = yield this.gpt.execute(promptTemplate.promptHuman, this.promptData, promptTemplate.promptSystem);
        });
    }
}
exports.default = PatPatBot;
