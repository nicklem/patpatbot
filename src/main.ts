import {ENV_OPENAI_API_KEY, ENV_REPO_NAME, ENV_DOCS_GLOB} from "./lib/init";
import GoogleSearch from "./lib/GoogleSearch";
import Gpt from "./lib/Gpt";
import PatPatBot from "./lib/PatPatBot";
import Repository from "./lib/Repository";
import logger from "./lib/logging";

async function run() {
    const bot = new PatPatBot(new Gpt(ENV_OPENAI_API_KEY), new GoogleSearch());
    const repo = new Repository(ENV_REPO_NAME, ENV_DOCS_GLOB);

    const maxIdx = Math.min(repo.docs.length, 10); // TODO remove this
    for (let idx = 0; idx < maxIdx; idx++) {
        const doc = repo.docs[idx];
        logger.info(`Processing pattern doc ${idx + 1} of ${repo.docs.length}:\n\n${JSON.stringify(doc.data, null, 2)}\n\n`)
        bot.setSourceDocData(doc);
        await bot.processSourceDoc();
        logger.info(`Improved description:\n\n${bot.getPromptDatum('examine')}\n\n`);
    }
}

run();
