import * as fs from 'fs';
import * as path from 'path';

type ToolOptions = 'google' | 'gpt';

class PromptTemplate {
    id: string;
    promptSystem: string;
    promptHuman: string;
    tool: ToolOptions;

    constructor(promptId: string, promptSystem: string, promptHuman: string, tool: ToolOptions) {
        this.id = promptId;
        this.promptSystem = promptSystem;
        this.promptHuman = promptHuman;
        this.tool = tool;
    }

    static load(filePath: string): PromptTemplate {
        const promptFileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const promptId = path.basename(filePath).match(/\d{2}-(.+)\.json$/)?.[1] || '';

        return new PromptTemplate(
            promptId,
            promptFileData.prompt_system,
            promptFileData.prompt_human,
            promptFileData.tool
        );
    }
}

export default PromptTemplate;
