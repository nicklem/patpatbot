import {config} from 'dotenv';
import {glob} from 'glob';
import {join} from 'path';

// Load environment variables
config();

const ENV_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ENV_DOCS_GLOB = process.env.INPUT_DOCS_GLOB;
const ENV_REPO_NAME = process.env.REPO_NAME;

const PATHS_DOCS = glob.sync(ENV_DOCS_GLOB || '');
const PATHS_PROMPTS = glob.sync(join(process.cwd(), "prompts", "*.json")).sort();

export {
    ENV_OPENAI_API_KEY,
    ENV_DOCS_GLOB,
    ENV_REPO_NAME,
    PATHS_DOCS,
    PATHS_PROMPTS,
};
