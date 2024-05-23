import {ChatOpenAI} from '@langchain/openai';
import {ChatPromptTemplate} from '@langchain/core/prompts';
import {StringOutputParser} from '@langchain/core/output_parsers';
import {IQueryable, PlainObject} from "./types";

type PromptTemplateMessages = Array<['system' | 'human', string]>;

class Gpt implements IQueryable {
    private model: ChatOpenAI;

    constructor(openaiApiKey: string, model: string = "gpt-4o") {
        this.model = new ChatOpenAI({ model, apiKey: openaiApiKey });
    }

    async execute(
        promptHuman: string,
        promptData: PlainObject = {},
        promptSystem?: string
    ): Promise<string> {
        const promptTemplateMessages: PromptTemplateMessages = [];

        if (promptSystem) {
            promptTemplateMessages.push(["system", promptSystem]);
        }

        promptTemplateMessages.push(["human", promptHuman]);

        return await this.doPromptFromMessages(promptTemplateMessages, promptData);
    }

    private async doPromptFromMessages(
        promptTemplateMessages: PromptTemplateMessages,
        promptData: PlainObject = {}
    ): Promise<string> {
        return await ChatPromptTemplate
            .fromMessages(promptTemplateMessages)
            .pipe(this.model)
            .pipe(new StringOutputParser())
            .invoke(promptData);
    }
}

export default Gpt;
