import {ChatOpenAI} from '@langchain/openai';
import {ChatPromptTemplate} from '@langchain/core/prompts';
import {StringOutputParser} from '@langchain/core/output_parsers';
import {IQueryable, PlainObject} from "./types";
import logger from "./logging";

type PromptTemplateMessages = Array<['system' | 'human' | 'ai', string]>;

class Gpt implements IQueryable {
    private model: ChatOpenAI;
    private readonly promptTemplateMessages: PromptTemplateMessages = [
        ["system", "You are a senior technical writer."],
    ];

    constructor(openaiApiKey: string, model: string = "gpt-4o") {
        this.model = new ChatOpenAI({ model, apiKey: openaiApiKey });
    }

    async execute(
        promptHuman: string,
        promptData: PlainObject = {},
        promptSystem?: string
    ): Promise<string> {
        if (promptSystem) {
            this.promptTemplateMessages[0] = ["system", promptSystem];
        }
        this.promptTemplateMessages.push(["human", promptHuman]);
        const output = (await this.doPromptFromMessages(promptData))
            .replace(/\{/g, '&#x7B;')
            .replace(/}/g, '&#x7D;')
        this.promptTemplateMessages.push(["ai", output]);
        logger.info(`State of the conversation: %o`, this.promptTemplateMessages);
        return output;
    }

    private async doPromptFromMessages(promptData: PlainObject): Promise<string> {
        return await ChatPromptTemplate
            .fromMessages(this.promptTemplateMessages, {})
            .pipe(this.model)
            .pipe(new StringOutputParser())
            .invoke(promptData);
    }
}

export default Gpt;
