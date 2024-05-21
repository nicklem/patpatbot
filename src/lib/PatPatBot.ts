import {FILES_PROMPTS} from './init';
import PromptTemplate from './PromptTemplate';
import DocFileData from './DocFileData';
import GoogleSearch from './GoogleSearch';
import Gpt from './Gpt';
import format from 'string-format';

class PatPatBot {
    private gpt: Gpt;
    private search: GoogleSearch;
    private promptTemplates: PromptTemplate[];
    private promptData: { [key: string]: any };

    constructor(gpt: Gpt, search: GoogleSearch) {
        this.gpt = gpt;
        this.search = search;
        this.promptTemplates = this.loadPromptTemplates();
        this.promptData = {};
    }

    setSourceDocData(docFileData: DocFileData) {
        this.promptData = docFileData.toDict();
    }

    async processSourceDoc() {
        for (const promptTemplate of this.promptTemplates) {
            if (promptTemplate.isSearch()) {
                await this.doSearch(promptTemplate);
            } else if (promptTemplate.isGpt) {
                await this.doPrompt(promptTemplate);
            }
        }
    }

    getPromptData(promptId: string) {
        return this.promptData[promptId];
    }

    private setPromptData(promptId: string, result: string) {
        this.promptData[promptId] = result;
    }

    private async doSearch(promptTemplate: PromptTemplate) {
        const prompt = format(promptTemplate.promptHuman, this.promptData);
        const result = await this.search.execute(prompt);
        this.setPromptData(promptTemplate.id, result);
    }

    private async doPrompt(promptTemplate: PromptTemplate) {
        const result = await this.gpt.execute(
            promptTemplate.promptHuman,
            this.promptData,
            promptTemplate.promptSystem,
        );
        this.setPromptData(promptTemplate.id, result);
    }

    private loadPromptTemplates(): PromptTemplate[] {
        return FILES_PROMPTS.map(filePath => PromptTemplate.fromFilePath(filePath));
    }
}

export default PatPatBot;
