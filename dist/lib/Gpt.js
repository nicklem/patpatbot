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
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
class Gpt {
    constructor(openaiApiKey, model = "gpt-4o") {
        this.model = new openai_1.ChatOpenAI({ model, apiKey: openaiApiKey });
    }
    execute(promptHuman_1) {
        return __awaiter(this, arguments, void 0, function* (promptHuman, promptData = {}, promptSystem) {
            const promptTemplateMessages = [];
            if (promptSystem) {
                promptTemplateMessages.push(["system", promptSystem]);
            }
            promptTemplateMessages.push(["human", promptHuman]);
            return yield this.doPromptFromMessages(promptTemplateMessages, promptData);
        });
    }
    doPromptFromMessages(promptTemplateMessages_1) {
        return __awaiter(this, arguments, void 0, function* (promptTemplateMessages, promptData = {}) {
            const prompt = prompts_1.ChatPromptTemplate.fromMessages(promptTemplateMessages);
            const outputParser = new output_parsers_1.StringOutputParser();
            const chain = prompt
                .pipe(this.model)
                .pipe(outputParser);
            return yield chain.invoke(promptData);
        });
    }
}
exports.default = Gpt;
