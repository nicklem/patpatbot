"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./lib/init");
const GoogleSearch_1 = __importDefault(require("./lib/GoogleSearch"));
const Gpt_1 = __importDefault(require("./lib/Gpt"));
const PatPatBot_1 = __importDefault(require("./lib/PatPatBot"));
const Repository_1 = __importDefault(require("./lib/Repository"));
function run() {
    const bot = new PatPatBot_1.default(new Gpt_1.default(init_1.ENV_OPENAI_API_KEY || ''), new GoogleSearch_1.default());
    const repo = new Repository_1.default(init_1.ENV_REPO_NAME || '', init_1.ENV_DOCS_GLOB || '');
    repo.docs.slice(0, 1).map(doc => {
        bot.setSourceDocData(doc);
        bot.processSourceDoc().then(() => {
            console.log(bot.getPromptData('examine'));
        });
    });
}
run();
