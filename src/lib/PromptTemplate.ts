import * as fs from 'fs';
import * as path from 'path';

type ToolOptions = 'google' | 'gpt';

interface PromptTemplateData {
    tool: ToolOptions;
    promptSystem?: string;
    promptHuman: string;
    parseOutput?: boolean;
};

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

    static load(filePath: string): PromptTemplate {
        return new PromptTemplate(
            path.basename(filePath).match(/\d{2}-(.+)\.json$/)?.[1] || '',
            JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        );
    }
}

export default PromptTemplate;
