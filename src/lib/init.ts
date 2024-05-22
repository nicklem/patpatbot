import {config} from 'dotenv';
import {glob} from 'glob';
import {join} from 'path';
import {getInput} from "@actions/core";
import github from "@actions/github";

// Load environment variables
config();

const ENV_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ENV_REPO_NAME = github?.context.repo.repo || process.env.REPO_NAME;

// TODO Default values don't work with this function. Should they?
const ENV_DOCS_GLOB =
    getInput('docs_glob')
    || "docs/description/*.md";
const ENV_DOC_DESCRIPTIONS_PATH =
    getInput('doc_descriptions_path')
    || "docs/description/description.json";
const ENV_DOC_PATTERNS_PATH =
    getInput('doc_patterns_path')
    || "docs/patterns.json";

console.log(ENV_REPO_NAME, ENV_DOCS_GLOB, ENV_DOC_DESCRIPTIONS_PATH, ENV_DOC_PATTERNS_PATH);

const PATHS_PROMPTS = glob.sync(join(__dirname, "..", "prompts", "*.json")).sort();

export {
    ENV_OPENAI_API_KEY,
    ENV_DOCS_GLOB,
    ENV_DOC_DESCRIPTIONS_PATH,
    ENV_DOC_PATTERNS_PATH,
    ENV_REPO_NAME,
    PATHS_PROMPTS,
};
