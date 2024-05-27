import {z} from 'zod';
import {config} from 'dotenv';
import {StringOutputParser, StructuredOutputParser} from '@langchain/core/output_parsers';
import {OutputFixingParser} from 'langchain/output_parsers';
import {ChatOpenAI} from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {API_KEY_OPENAI} from "./lib/init";
import logger from "./lib/logging";
import Scraper from "./lib/Scraper";
import format from 'string-format';

// TODO remove all `any`

type PromptTemplateMessages = Array<['system' | 'human' | 'ai', string]>;
type AvailableModels = 'gpt-3.5-turbo-0125' | 'gpt-4o' | 'search';

config();

type BaseOutput = z.ZodString | z.ZodNumber | z.ZodBoolean;
type OutputSchemaEntry = z.ZodArray<BaseOutput> | BaseOutput;

type GPTStep = {
    service: 'gpt';
    modelProcess: AvailableModels;
    modelFix: AvailableModels;
    promptSystem?: string;
    outputSchema: Record<string, OutputSchemaEntry>;
}

type SearchStep = {
    service: 'search';
}

type ReduceStep = {
    service: 'reduce';
    outputFormat: 'plainText' | 'jsonEncode';
}

type IChatStep<T extends StepGeneric> = {
    id: string; // must be unique
    service: T['service']
    promptTemplate: string
} & T;

type IChatStepClass<T extends StepGeneric> = {
    run: (context: Context) => Promise<Context>
} & IChatStep<T>

type StepGeneric = GPTStep | SearchStep | ReduceStep;

type ChatStepGeneric = IChatStep<GPTStep | SearchStep | ReduceStep>;

type BaseInput = string | number | boolean;

type BaseInputEntry = Array<BaseInput> | BaseInput;

type Context = Record<string, BaseInputEntry>;

type PartialContext = Partial<Context>;

const models: Partial<Record<AvailableModels, ChatOpenAI>> = {
    'gpt-4o': new ChatOpenAI({
        model: 'gpt-4o',
        apiKey: API_KEY_OPENAI,
    }),
    'gpt-3.5-turbo-0125': new ChatOpenAI({
        model: 'gpt-3.5-turbo-0125',
        apiKey: API_KEY_OPENAI,
    }),
}
abstract class BaseChatStep<T extends StepGeneric, U>
    implements IChatStepClass<any>
{
    readonly OUTPUT_KEY_DEFAULT = 'output';

    readonly service: T['service'];
    readonly id: string;
    readonly promptTemplate: string;

    protected constructor(params: IChatStep<T>) {
        this.service = params.service;
        this.id = params.id;
        this.promptTemplate = params.promptTemplate;

        this._processRequest = this._processRequest.bind(this);
    }

    async run(context: Context): Promise<Context> {
        const taskContexts = this._extractTaskContexts(context);
        const tasks = taskContexts.map(this._processRequest);
        const results = await Promise.all(tasks);
        const output = this._gatherResults(results);

        return this._formatOutput(output);
    }

    /**
     * Extracts task contexts from the given context.
     * E.g.: `{p: 0, q: [0, 1]}` to `[{p: 0, q: 0}, {p: 0, q: 1}]`.
     */
    protected _extractTaskContexts(context: Context): Array<PartialContext> {
        const promptTemplateKeys = this.promptTemplate
            .match(/{\w+}/g)
            .map((key) => key?.replace(/[{}]/g, ''))
            .filter((key) => key && !key.startsWith('__'));

        const relevantValues = promptTemplateKeys.map(k => context[k]);

        const maxIdx = Math.max(...relevantValues.map(v => Array.isArray(v) ? v.length : -1));

        if(maxIdx === -1) {
            return [context];
        }

        return Array.from({length: maxIdx}, (_, idx) => {
            const values: PartialContext = {};

            promptTemplateKeys.forEach(k => {
                const v = context[k];
                if(Array.isArray(v)) {
                    // Default to the last value.
                    values[k] = v[idx] ?? v[v.length - 1];
                } else {
                    values[k] = v;
                }
            });

            return values;
        });
    }

    protected _formatOutput(output: PartialContext): PartialContext {
        const outputFormatted = {};
        for(const key in output) {
            outputFormatted[`${this.id}__${key}`] = output[key];
        }

        return outputFormatted;
    }

    abstract _processRequest(context: PartialContext, idx?: number): Promise<U>

    abstract _gatherResults(output: Array<U>): PartialContext;
}

class ChatStepGpt
    extends BaseChatStep<GPTStep, PartialContext>
    implements IChatStepClass<GPTStep>
{
    readonly modelProcess: AvailableModels;
    readonly modelFix: AvailableModels;
    readonly promptSystem?: string;
    readonly outputSchema: Record<string, z.ZodArray<BaseOutput> | BaseOutput>;

    constructor(params: IChatStep<GPTStep>) {
        super(params);

        this.modelProcess = params.modelProcess;
        this.modelFix = params.modelFix;
        this.promptSystem = params.promptSystem;
        this.outputSchema = params.outputSchema;
    }

    async _processRequest(context: PartialContext): Promise<PartialContext> {
        const inputMessages: PromptTemplateMessages = this.promptSystem
            ? [['system', this.promptSystem]]
            : [];

        inputMessages.push(['human', this.promptTemplate + ' {__formatInstructions}']);

        const jsonParser = StructuredOutputParser.fromZodSchema(z.object(this.outputSchema));

        const plainOutput = await ChatPromptTemplate
            .fromMessages(inputMessages)
            .pipe(models[this.modelProcess])
            .pipe(new StringOutputParser())
            .invoke({
                ...context,
                __formatInstructions: jsonParser.getFormatInstructions()
            });

        return await jsonParser
            .parse(plainOutput)
            .catch(async () => {
                logger.info('Fixing output parsing error for step \`%s\`', this.id);

                return await OutputFixingParser
                    .fromLLM(models[this.modelFix], jsonParser)
                    .parse(plainOutput);
            });
    }

    _gatherResults(output: Array<PartialContext>): PartialContext {
        if(output.length === 1) {
            return output[0];
        }

        const outputGathered = {};
        for(const key in output[0]) {
            outputGathered[key] = output.map(o => o[key]);
        }

        return outputGathered;
    }
}

class ChatStepSearch
    extends BaseChatStep<SearchStep, Array<string>>
    implements IChatStepClass<SearchStep>
{
    constructor(params: IChatStep<SearchStep>) {
        super(params);
    }

    async _processRequest(context: PartialContext, idx: number): Promise<Array<string>> {
        // TODO Adding a delay to avoid rate limiting. Improve this.
        await new Promise(r => setTimeout(r, 10000 * idx));
        const query = format(this.promptTemplate, context);
        return (await Scraper.searchAndScrape(query)).slice(0, 3);
    }

    _gatherResults(output: Array<Array<string>>): PartialContext {
        return {
            [this.OUTPUT_KEY_DEFAULT]: output.flat(),
        }
    }
}

class ChatStepReduce
    extends BaseChatStep<ReduceStep, string>
    implements IChatStepClass<ReduceStep>
{
    readonly outputFormat: 'plainText' | 'jsonEncode';

    constructor(params: IChatStep<ReduceStep>) {
        super(params);

        this.outputFormat = params.outputFormat;
    }

    async _processRequest(context: PartialContext): Promise<string> {
        return format(this.promptTemplate, context);
    }

    _gatherResults(output: Array<string>): PartialContext {
        return {
            [this.OUTPUT_KEY_DEFAULT]: this._formatOutputValue(output),
        }
    }

    _formatOutputValue(value: Array<string>): string {
        switch (this.outputFormat) {
            case 'jsonEncode':
                return JSON.stringify(value);
            default:
                return value.join('\n');
        }
    }
}

class ChatStepFactory {
    static createStep(step: ChatStepGeneric): IChatStepClass<StepGeneric> {
        switch(step.service) {
            case 'gpt':
                return new ChatStepGpt(step);
            case 'search':
                return new ChatStepSearch(step);
            case 'reduce':
                return new ChatStepReduce(step);
        }
    }
}

const steps: Array<ChatStepGeneric> = [
    {
        id: 'extractLanguage',
        service: 'gpt',
        modelProcess: 'gpt-3.5-turbo-0125',
        modelFix: 'gpt-3.5-turbo-0125',
        promptSystem:
            "You are a world-class specialist in programming languages and frameworks.",
        promptTemplate:
            "Your task is to infer what language this query refers to: `{init__query}`.",
        outputSchema: {
            reasoning: z.string()
                .describe(
                    "Reason over which language the query may refer to, " +
                    "based only on the content of the query and your intuition. " +
                    "About 100 words."
                ),
            language: z.string()
                .describe(
                    "The programming language inferred from the query. " +
                    "Include only the programming language name. " +
                    "Examples: `Python`, `JavaScript`, `Java`, `C++`, `unknown`."
                ),
            framework: z.string()
                .describe(
                    "The framework, library, or similar referred to in the query. " +
                    "Examples: `React`, `Laravel`, `Spring`, `unknown`."
                ),
        }
    },
    {
        id: 'formatSearchArray',
        service: 'gpt',
        modelProcess: 'gpt-3.5-turbo-0125',
        modelFix: 'gpt-3.5-turbo-0125',
        promptSystem:
            "You are a world-class specialist in programming languages and frameworks.",
        promptTemplate:
            "Analyze search string `{init__query}` relevant to programming language " +
            "`{extractLanguage__language}` and framework `{extractLanguage__framework}`",
        outputSchema: {
            reasoning: z
                .string()
                .describe(
                    "Reason over the potential meaning of the input data, " +
                    "based only on its content and your intuition. " +
                    "About 100 words."
                ),
            queries: z
                .array(z.string())
                .length(1)
                .describe(
                    "Search queries to execute in Google " +
                    "and further research the input data."
                ),
        }
    },
    {
        id: 'searchAndScrapeArray',
        service: 'search',
        promptTemplate: "{formatSearchArray__queries}",
    },
    {
        id: 'summarizeResultsArray',
        service: 'gpt',
        modelProcess: 'gpt-3.5-turbo-0125',
        modelFix: 'gpt-3.5-turbo-0125',
        promptSystem:
            "You are a world-class specialist in static code analysis patterns.",
        promptTemplate:
            "A web search `{init__query}` to investigate static analysis tool pattern " +
            "`{init__patternId}` pertaining to language `{extractLanguage__language}` " +
            "yielded result `{searchAndScrapeArray__output}`. " +
            "Your task is to summarize the research result, which will be grouped with similar ones " +
            "as a source of contextual information to update the existing documentation.",
        outputSchema: {
            languageReasoning: z
                .string()
                .describe(
                    "Reason over which language the result may refer to, " +
                    "based only on the content of the result and on your intuition. " +
                    "About 100 words."
                ),
            searchLanguage: z
                .string()
                .describe(
                    "The programming language mentioned in the prompt. " +
                    "Include only the programming language name. " +
                    "Examples: `Python`, `JavaScript`, `Java`, `C++`, `unknown`."
                ),
            resultLanguage: z
                .string()
                .describe(
                    "The programming language inferred from the search result. " +
                    "Include only the programming language name. " +
                    "Examples: `Python`, `JavaScript`, `Java`, `C++`, `unknown`."
                ),
            isRelevant: z
                .boolean()
                .describe(
                    "Whether searchLanguage is equal to resultLanguage."
                ),
            summaryReasoning: z
                .string()
                .describe(
                    "Three hypotheses on what the result may be referring to, " +
                    "centered around points relevant to the query. " +
                    "About 200 words."
                ),
            summary: z
                .string()
                .describe(
                    "A summary of the result, " +
                    "centered around points relevant to the query. " +
                    "About 500 words."
                ),
        }
    },
    {
        id: 'summariesReduce',
        service: 'reduce',
        promptTemplate: "relevant: {summarizeResultsArray__isRelevant}; description: {summarizeResultsArray__summary}",
        outputFormat: 'jsonEncode',
    },
    {
        id: 'writeDocumentation',
        service: 'gpt',
        modelProcess: 'gpt-4o',
        modelFix: 'gpt-3.5-turbo-0125',
        promptSystem:
            "You are a world-class technical writer.",
        promptTemplate:
            "Update documentation file content `{init__content}` " +
            "about static analysis issue `{init__patternId}` " +
            "relevant to language `{extractLanguage__language}`. " +
            "Consider the following contextual summaries of search results: `{summariesReduce__output}`. " +
            "Use a professional, helpful tone.",
        outputSchema: {
            reasoning: z.string()
                .describe(
                    "Reason over the user's request, " +
                    "based on its content and your intuition. " +
                    "About 200 words."
                ),
            title: z.string()
                .describe("An appropriate title for the code pattern."),
            excerpt: z.string()
                .describe("A brief excerpt of the code pattern of up to about 10 words."),
            content: z.string()
                .describe("A longer description of the issue and related solution, of up to about 50 words."),
            exampleIssue: z.string()
                .describe(
                    "A code example of the issue " +
                    "in the relevant programming language " +
                    "unwrapped, as it would appear by running `cat` on a source code file." +
                    "Example in JavaScript: `function example() { retur 1; }`."
                ),
            exampleSolution: z.string()
                .describe(
                    "A code example of the solution to the issue " +
                    "in the relevant programming language " +
                    "unwrapped, as it would appear by running `cat` on a source code file." +
                    "Example in JavaScript: `function example() { return 1; }`."
                ),
            exampleIssueProblem: z.string()
                .describe("A brief description of the issue in the code example. About 10 words."),
            exampleIssueSolution: z.string()
                .describe("A brief description of the proposed solution to the issue in the code example. About 10 words."),
        },
    },
    {
        id: 'formatOutput',
        service: 'reduce',
        promptTemplate: "{writeDocumentation__content}",
        outputFormat: 'plainText',
    },
];

async function search() {
    const context = {
        init__query: 'CakePHP Classes ReturnTypeHint Classes: Return Type Hint',
        init__patternId: 'CakePHP-Classes-ReturnTypeHint',
        init__content: 'Classes: Return Type Hint',
    }

    for (const step of steps) {
        Object.assign(
            context,
            await ChatStepFactory.createStep(step).run(context)
        );
    }

    console.log((context as any).formatOutput__output);
}

search();
