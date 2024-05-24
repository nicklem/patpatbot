import DocFile from "./DocFile";
import PromptTemplate from "./PromptTemplate";

export type FlatObject = Record<string, string>

export type ToolOptions = 'google' | 'gpt';

// The output of the query chain.
export type BotOutput = {
    title: string;
    summary: string;
    description: string;
};

// The input to the query chain.
// Note: after the query chain is executed,
// the output is added to the input and partially overwrites it.
export type DocData = Partial<BotOutput> & {
    shortDescription: string;
    path: string;
    patternId: string;
    description: string;
    updatedDate?: string;
};

export interface IQueryable {
    execute(promptHuman: PromptTemplate, promptData: FlatObject): Promise<FlatObject>;
}

// The following helper types represent the shape of the data that is stored in the meta files.
export type DocDescription = {
    patternId: string,
    title: string,
    description: string,
    patPatBotReviewed?: string,
};
export type MetaDescriptions = DocDescription[]; // see docs/description/description.json
export type MetaPatterns = { patterns: MetaDescriptions }; // see docs/patterns.json
export type MetaData = MetaDescriptions | MetaPatterns;

// The following helper types represent the expected shape of the prompt files content.
export type PromptTemplateData = {
    tool: ToolOptions;
    promptSystem?: string;
    promptHuman: string;
    parseOutput?: boolean;
}
