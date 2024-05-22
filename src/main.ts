import {
    ENV_OPENAI_API_KEY,
    ENV_REPO_NAME,
    ENV_DOCS_GLOB,
    ENV_DOC_DESCRIPTIONS_PATH,
    ENV_DOC_PATTERNS_PATH
} from "./lib/init";
import GoogleSearch from "./lib/GoogleSearch";
import Gpt from "./lib/Gpt";
import PatPatBot from "./lib/PatPatBot";
import Repository from "./lib/Repository";
import logger from "./lib/logging";

async function run() {
    const bot = new PatPatBot(
        new Gpt(ENV_OPENAI_API_KEY),
        new GoogleSearch()
    );

    const repo = new Repository(
        ENV_REPO_NAME,
        ENV_DOCS_GLOB,
        ENV_DOC_DESCRIPTIONS_PATH,
        ENV_DOC_PATTERNS_PATH,
    );

    const maxIdx = Math.min(repo.docs.length, 3); // TODO remove this
    for (let idx = 0; idx < maxIdx; idx++) {
        const doc = repo.docs[idx];
        logger.info(`Processing pattern ${idx + 1} of ${repo.docs.length}:\n%o`, doc.dataPrefixed);
        bot.setSourceDocData(doc);
        await bot.processSourceDoc();
        const outputData = bot.getOutputData();
        logger.info(`Saving GPT-improved doc data:\n%o`, outputData);
        repo.updateDoc(doc, outputData);
        repo.updateDescriptionsAndPatterns(doc, outputData);
    }

    repo.saveDescriptionsAndPatterns();
}

run();
