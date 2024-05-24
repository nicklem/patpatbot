import * as fs from 'fs';
import * as path from 'path';
import {FlatObject, PromptTemplateData, ToolOptions} from "./types";

class PromptTemplate implements PromptTemplateData {
    id: string;
    promptSystem: string;
    promptHuman: string;
    tool: ToolOptions;
    parseOutput: boolean;

    constructor(promptId: string, data: PromptTemplateData) {
        this.id = promptId;
        this.tool = data.tool;
        this.promptSystem = data.promptSystem || null;
        this.promptHuman = data.promptHuman;
        this.parseOutput = data.parseOutput || false;
    }

    formatOutput(output: string): FlatObject {
        if(this.tool === 'gpt' && this.parseOutput) {
            return this.extractXmlAsObject(output);
        }

        return {output};
    }

    static load(filePath: string): PromptTemplate {
        return new PromptTemplate(
            path.basename(filePath).match(/^\d{2}-(.+)\.json$/)?.[1] || '',
            JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        );
    }

    /**
     * @param answer - GPT response containing data in XML-like format.
     * @returns - Extracted data as a plain JS object with tags as keys.
     */
    private extractXmlAsObject(answer: string): FlatObject {
        const output: FlatObject = {};
        const tagsMatch = answer.matchAll(/<([a-zA-Z0-9\-_]+)>/g);
        for (const match of tagsMatch) {
            const tag = match[1];
            const answerTag =
                answer.match(new RegExp(`<${tag}>[^]+</${tag}>`, 'g'))?.[0]
                || 'TODO malformed GPT output.'; // TODO handle this better by asking GPT to check.

            output[tag] = answerTag
                .replace(new RegExp(`<${tag}>|</${tag}>`, 'g'), '')
                .trim();
        }
        return output;
    }
}

export default PromptTemplate;
