import {PATHS_PROMPTS} from './init';
import PromptTemplate from './PromptTemplate';
import DocumentationFile from './DocumentationFile';
import GoogleSearch from './GoogleSearch';
import Gpt from './Gpt';
import logger from "./logging";
import {parseString} from 'xml2js';
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
        this.promptData = docFileData.data;
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
        const answerObj = await this.extractDataFromAnswer(answerStr, promptTemplate.id);
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
    private async extractDataFromAnswer(
        answer: string,
        promptTemplateId: string
    ): Promise<Record<string, string>> {
        return new Promise((resolve, reject) => {
            parseString(
                `<root>${answer}</root>`,
                (err, result: Record<string, any>) => {
                    if (err) {
                        reject(err);
                    }

                    const output = {};

                    for (const key in result.root) {
                        if (key === '_') {
                            continue;
                        }

                        output[`${promptTemplateId}__${key}`] = result.root[key]?.[0];
                    }

                    resolve(output);
                });
        });
    }
}

export default PatPatBot;
