import {config} from 'dotenv';
import {glob} from 'glob';
import {join} from 'path';
import {getInput} from "@actions/core";

// Load environment variables
config();

const API_KEY_OPENAI = process.env.OPENAI_API_KEY;
const REPO_NAME = process.env.GITHUB_REPOSITORY.split("/")[1];

// TODO getInput doesn't read default values from action.yml. Should it?
const DOCS_DIR =
    getInput('docs_glob')
    || "docs/description";
const DOC_DESCRIPTIONS_PATH =
    getInput('doc_descriptions_path')
    || "docs/description/description.json";
const DOC_PATTERNS_PATH =
    getInput('doc_patterns_path')
    || "docs/patterns.json";

const PATHS_PROMPTS = glob.sync(join(__dirname, "..", "prompts", "*.json")).sort();

export {
    API_KEY_OPENAI,
    DOCS_DIR,
    DOC_DESCRIPTIONS_PATH,
    DOC_PATTERNS_PATH,
    REPO_NAME,
    PATHS_PROMPTS,
};
