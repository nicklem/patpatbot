import {PATHS_PROMPTS} from './init';
import PromptTemplate from './PromptTemplate';
import DocumentationFile from './DocumentationFile';
import GoogleSearch from './GoogleSearch';
import Gpt from './Gpt';
import logger from "./logging";
import {PatPatBotOutput} from "./types";

const OUTPUT_PROMPT_ID = 'output';

class PatPatBot {
    private readonly gpt: Gpt;
    private readonly search: GoogleSearch;
    private readonly promptTemplates: PromptTemplate[];
    private promptData: Record<string, string>;

    constructor(gpt: Gpt, search: GoogleSearch) {
        this.gpt = gpt;
        this.search = search;
        this.promptData = {};
        this.promptTemplates = PATHS_PROMPTS.map(PromptTemplate.load);
        logger.info(`Found ${this.promptTemplates.length} prompt templates.`);
    }

    setSourceDocData(docFileData: DocumentationFile) {
        this.promptData = docFileData.dataPrefixed;
    }

    async processSourceDoc() {
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

    getPromptData(promptId: string = OUTPUT_PROMPT_ID) {
        const output = {};

        for (const key in this.promptData) {
            if (key.startsWith(promptId)) {
                output[key] = this.promptData[key];
            }
        }

        return output;
    }

    getOutputData(): PatPatBotOutput {
        const outputDataWithPrefix = this.getPromptData(OUTPUT_PROMPT_ID);
        const outputData: PatPatBotOutput = {} as PatPatBotOutput;
        for(const key in outputDataWithPrefix) {
            const keyWithoutPrefix = key.replace(`${OUTPUT_PROMPT_ID}__`, '');
            outputData[keyWithoutPrefix] = outputDataWithPrefix[key];
        }
        return outputData;
    }

    private async doSearch(promptTemplate: PromptTemplate) {
        this.promptData[promptTemplate.id] = await this.search.execute(
            promptTemplate.promptHuman,
            this.promptData,
        );
    }

    private async doPrompt(promptTemplate: PromptTemplate) {
        const answerStr = await this.gpt.execute(
            promptTemplate.promptHuman,
            this.promptData,
            promptTemplate.promptSystem,
        );
        const answerObj = this.extractDataFromAnswer(answerStr, promptTemplate.id);
        this.promptData = {...this.promptData, ...answerObj};
    }

    /**
     * Parse bot output as XML-like and extract data from it.
     *
     * @param answer - Bot output as a string
     * @param promptTemplateId - ID of the prompt template that generated the answer
     *
     * @returns - Extracted data as a plain JS object.
     */
    private extractDataFromAnswer(
        answer: string,
        promptTemplateId: string
    ): Record<string, string> {
        const tagsMatch = answer.matchAll(/<([a-zA-Z0-9\-_]+)>/g);
        const output: Record<string, string> = {};
        for (const match of tagsMatch) {
            const tag = match[1];
            const tagMatch = answer.match(new RegExp(`<${tag}>[^]+</${tag}>`, 'g'));
            output[`${promptTemplateId}__${tag}`] = tagMatch[0]
                .replace(new RegExp(`<${tag}>|</${tag}>`, 'g'), '');
        }
        return output;
    }
}

export default PatPatBot;
