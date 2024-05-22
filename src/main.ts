import {ENV_OPENAI_API_KEY, ENV_REPO_NAME, ENV_DOCS_GLOB} from "./lib/init";
import GoogleSearch from "./lib/GoogleSearch";
import Gpt from "./lib/Gpt";
import PatPatBot from "./lib/PatPatBot";
import Repository from "./lib/Repository";
import logger from "./lib/logging";

async function run() {
    const bot = new PatPatBot(new Gpt(ENV_OPENAI_API_KEY), new GoogleSearch());
    const repo = new Repository(ENV_REPO_NAME, ENV_DOCS_GLOB);

    const maxIdx = Math.min(repo.docs.length, 1); // TODO remove this
    for (let idx = 0; idx < maxIdx; idx++) {
        const doc = repo.docs[idx];
        logger.info(`Processing pattern doc ${idx + 1} of ${repo.docs.length}. Content:\n%o`, doc.data);
        bot.setSourceDocData(doc);
        await bot.processSourceDoc();
        const outputData = bot.getOutputData();
        logger.info(`Saving improved pattern doc data:\n%o`, outputData);
        doc.update(outputData.description);
    }
}

run();
