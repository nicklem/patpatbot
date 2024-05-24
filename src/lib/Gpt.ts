import {ChatOpenAI} from '@langchain/openai';
import {ChatPromptTemplate} from '@langchain/core/prompts';
import {StringOutputParser} from '@langchain/core/output_parsers';
import {IQueryable, FlatObject} from "./types";
import logger from "./logging";
import PromptTemplate from "./PromptTemplate";

type PromptTemplateMessages = Array<['system' | 'human' | 'ai', string]>;

const PROMPT_SYSTEM_DEFAULT = "You are a senior technical writer.";

class Gpt implements IQueryable {
    private model: ChatOpenAI;
    private promptTemplateMessages: PromptTemplateMessages = [["system", PROMPT_SYSTEM_DEFAULT]];

    constructor(openaiApiKey: string, model: string = "gpt-4o") {
        this.model = new ChatOpenAI({ model, apiKey: openaiApiKey });
    }

    reset() {
        this.promptTemplateMessages = [["system", PROMPT_SYSTEM_DEFAULT]];
    }

    async execute(
        promptTemplate: PromptTemplate,
        promptData: FlatObject = {},
    ): Promise<FlatObject> {
        if (promptTemplate.promptSystem) {
            this.promptTemplateMessages[0] = ["system", promptTemplate.promptSystem];
        }
        this.promptTemplateMessages.push(["human", promptTemplate.promptHuman]);
        const output = await this.doPromptFromMessages(promptData);
        this.promptTemplateMessages.push(["ai", this.escapeCurlyBraces(output)]);
        logger.info(`Last AI reply: %o [...]`, output.slice(0, 100));

        return promptTemplate.formatOutput(output);
    }

    private async doPromptFromMessages(promptData: FlatObject): Promise<string> {
        return await ChatPromptTemplate
            .fromMessages(this.promptTemplateMessages, {})
            .pipe(this.model)
            .pipe(new StringOutputParser())
            .invoke(promptData);
    }

    /**
     * Escapes curly braces in the string to avoid confusing the template engine
     * with GPT responses containing curly braces.
     */
    private escapeCurlyBraces(str: string): string {
        return str
            .replace(/\{/g, '&#x7B;')
            .replace(/}/g, '&#x7D;');
    }
}

export default Gpt;
