import {config} from 'dotenv';
import {glob} from 'glob';
import {join} from 'path';

// Load environment variables
config();

const ENV_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ENV_DOCS_GLOB = process.env.INPUT_DOCS_GLOB;
const ENV_DOC_DESCRIPTIONS_PATH = process.env.INPUT_DOC_DESCRIPTIONS_PATH;
const ENV_DOC_PATTERNS_PATH = process.env.INPUT_DOC_PATTERNS_PATH;
const ENV_REPO_NAME = process.env.REPO_NAME;

const PATHS_PROMPTS = glob.sync(join(__dirname, "..", "prompts", "*.json")).sort();

export {
    ENV_OPENAI_API_KEY,
    ENV_DOCS_GLOB,
    ENV_DOC_DESCRIPTIONS_PATH,
    ENV_DOC_PATTERNS_PATH,
    ENV_REPO_NAME,
    PATHS_PROMPTS,
};
