import {PATHS_PROMPTS} from './init';
import PromptTemplate from './PromptTemplate';
import DocumentationFile from './DocumentationFile';
import GoogleSearch from './GoogleSearch';
import Gpt from './Gpt';
import logger from "./logging";
import {DocumentationFileData, PatPatBotOutput} from "./types";
import {flatten} from "flat";

const INPUT_ID = 'input';
const OUTPUT_ID = 'output';

type PlainObject = Record<string, string>
type AllPromptData = Record<string, PlainObject> & {
    [INPUT_ID]: DocumentationFileData,
    [OUTPUT_ID]: PatPatBotOutput,
}

class PatPatBot {
    private readonly gpt: Gpt;
    private readonly search: GoogleSearch;

    private readonly promptTemplates: PromptTemplate[];
    private readonly promptData: AllPromptData = {
        [INPUT_ID]: null,
        [OUTPUT_ID]: null
    };

    constructor(gpt: Gpt, search: GoogleSearch) {
        this.gpt = gpt;
        this.search = search;
        this.promptTemplates = PATHS_PROMPTS.map(PromptTemplate.load);
        logger.info(`Found ${this.promptTemplates.length} prompt templates.`);
    }

    async processPatternDoc(doc: DocumentationFile): Promise<PatPatBotOutput> {
        this.setPromptData(INPUT_ID, doc.data);
        await this.executePrompts();
        return this.promptData[OUTPUT_ID];
    }

    private setPromptData(k: string, v: PlainObject) {
        this.promptData[k] = v;
    }

    private getPromptDataFlat(): PlainObject {
        return flatten(this.promptData, {delimiter: '__'})
    }

    private async executePrompts() {
        for (const promptTemplate of this.promptTemplates) {
            switch (promptTemplate.tool) {
                case 'google':
                    await this.doSearch(promptTemplate);
                    break;
                case 'gpt':
                    await this.doPrompt(promptTemplate);
                    break;
            }
        }
    }

    private async doSearch(promptTemplate: PromptTemplate) {
        const output = await this.search.execute(
            promptTemplate.promptHuman,
            this.getPromptDataFlat(),
        );
        this.setPromptData(promptTemplate.id, {output});
    }

    private async doPrompt(promptTemplate: PromptTemplate) {
        const output = await this.gpt.execute(
            promptTemplate.promptHuman,
            this.getPromptDataFlat(),
            promptTemplate.promptSystem,
        );
        const outputParsed = this.extractDataFromAnswer(output);
        this.setPromptData(promptTemplate.id, outputParsed);
    }

    /**
     * Parse bot output as XML-like and extract data from it.
     *
     * @param answer - Bot output as a string
     *
     * @returns - Extracted data as a plain JS object.
     */
    private extractDataFromAnswer(answer: string): PlainObject {
        const output: PlainObject = {};
        const tagsMatch = answer.matchAll(/<([a-zA-Z0-9\-_]+)>/g);
        for (const match of tagsMatch) {
            const tag = match[1];
            output[tag] = answer
                .match(new RegExp(`<${tag}>[^]+</${tag}>`, 'g'))[0]
                .replace(new RegExp(`<${tag}>|</${tag}>`, 'g'), '')
                .trim();
        }
        return output;
    }
}

export default PatPatBot;
