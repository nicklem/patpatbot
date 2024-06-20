import {config} from 'dotenv';
import {glob} from 'glob';
import {join} from 'path';
import {getInput} from "@actions/core";

config();

const API_KEY_OPENAI = process.env.OPENAI_API_KEY;
const REPO_NAME = process.env.GITHUB_REPOSITORY.split("/")[1];
const PATHS_PROMPTS = glob.sync(join(__dirname, "..", "prompts", "*.json")).sort();

// TODO getInput doesn't read default values from action.yml locally. Should it?
const DOCS_DIR = getInput('docs_dir') || "docs/description";
const DOC_DESCRIPTIONS_PATH = getInput('doc_descriptions_path') || "docs/description/description.json";

export {
    API_KEY_OPENAI,
    REPO_NAME,
    PATHS_PROMPTS,
    DOCS_DIR,
    DOC_DESCRIPTIONS_PATH,
};
