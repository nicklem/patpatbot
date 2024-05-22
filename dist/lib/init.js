"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATHS_PROMPTS = exports.PATHS_DOCS = exports.ENV_REPO_NAME = exports.ENV_DOCS_GLOB = exports.ENV_OPENAI_API_KEY = void 0;
const dotenv_1 = require("dotenv");
const glob_1 = require("glob");
const path_1 = require("path");
// Load environment variables
(0, dotenv_1.config)();
const PATH_PROJECT = (0, path_1.dirname)((0, path_1.dirname)((0, path_1.dirname)(__filename)));
const ENV_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
exports.ENV_OPENAI_API_KEY = ENV_OPENAI_API_KEY;
const ENV_DOCS_GLOB = process.env.INPUT_DOCS_GLOB;
exports.ENV_DOCS_GLOB = ENV_DOCS_GLOB;
const ENV_REPO_NAME = process.env.REPO_NAME;
exports.ENV_REPO_NAME = ENV_REPO_NAME;
const PATHS_DOCS = glob_1.glob.sync(ENV_DOCS_GLOB || '');
exports.PATHS_DOCS = PATHS_DOCS;
const PATHS_PROMPTS = glob_1.glob.sync((0, path_1.join)(PATH_PROJECT, "prompts", "*.json")).sort();
exports.PATHS_PROMPTS = PATHS_PROMPTS;
