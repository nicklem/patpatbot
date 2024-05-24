import {PATHS_PROMPTS} from './init';
import PromptTemplate from './PromptTemplate';
import GoogleSearch from './GoogleSearch';
import Gpt from './Gpt';
import logger from "./logging";
import {BotOutput, DocData, FlatObject} from "./types";
import {flatten} from "flat";

export const INPUT_ID = 'input';
export const OUTPUT_ID = 'output';

export type AllPromptData = Record<string, FlatObject> & {
    [INPUT_ID]: DocData,
    [OUTPUT_ID]: BotOutput,
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

    async processDoc(data: DocData): Promise<BotOutput> {
        this.setPromptData(INPUT_ID, data);
        this.gpt.reset();
        await this.executePrompts();
        return this.promptData[OUTPUT_ID];
    }

    private setPromptData(k: string, v: FlatObject) {
        this.promptData[k] = v;
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
        this.setPromptData(
            promptTemplate.id,
            await this.search.execute(
                promptTemplate,
                this.getPromptDataFlat(),
            ),
        );
    }

    private async doPrompt(promptTemplate: PromptTemplate) {
        this.setPromptData(
            promptTemplate.id,
            await this.gpt.execute(
                promptTemplate,
                this.getPromptDataFlat(),
            ),
        );
    }

    private getPromptDataFlat(): FlatObject {
        return flatten(this.promptData, {delimiter: '__'})
    }
}

export default PatPatBot;
