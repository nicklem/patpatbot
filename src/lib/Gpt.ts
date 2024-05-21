import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

class Gpt {
    private model: ChatOpenAI;

    constructor(openaiApiKey: string, model: string = "gpt-4o") {
        this.model = new ChatOpenAI({ model, apiKey: openaiApiKey });
    }

    async execute(
        promptHuman: string,
        promptData: Record<string, string> = {},
        promptSystem?: string
    ): Promise<string> {
        const promptTemplateMessages: Array<[string, string]> = [];

        if (promptSystem) {
            promptTemplateMessages.push(["system", promptSystem]);
        }

        promptTemplateMessages.push(["human", promptHuman]);

        return await this.doPromptFromMessages(promptTemplateMessages, promptData);
    }

    private async doPromptFromMessages(promptTemplateMessages: Array<[string, string]>, promptData: Record<string, any> = {}): Promise<string> {
        const prompt = ChatPromptTemplate.fromMessages(promptTemplateMessages);
        const outputParser = new StringOutputParser();

        const chain = prompt
            .pipe(this.model)
            .pipe(outputParser);

        return await chain.invoke(promptData);
    }
}

export default Gpt;
