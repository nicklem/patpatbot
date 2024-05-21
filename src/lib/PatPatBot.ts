import {PATHS_PROMPTS} from './init';
import PromptTemplate from './PromptTemplate';
import DocumentationFile from './DocumentationFile';
import GoogleSearch from './GoogleSearch';
import Gpt from './Gpt';

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

    getPromptDatum(promptId: string) {
        return this.promptData[promptId];
    }

    private async doSearch(promptTemplate: PromptTemplate) {
        this.promptData[promptTemplate.id] = await this.search.execute(
            promptTemplate.promptHuman,
            this.promptData,
        );
    }

    private async doPrompt(promptTemplate: PromptTemplate) {
        this.promptData[promptTemplate.id] = await this.gpt.execute(
            promptTemplate.promptHuman,
            this.promptData,
            promptTemplate.promptSystem,
        );
    }
}

export default PatPatBot;
