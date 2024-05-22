import {ENV_OPENAI_API_KEY, ENV_REPO_NAME, ENV_DOCS_GLOB} from "./lib/init";
import GoogleSearch from "./lib/GoogleSearch";
import Gpt from "./lib/Gpt";
import PatPatBot from "./lib/PatPatBot";
import Repository from "./lib/Repository";
import logger from "./lib/logging";

function run() {
    const bot = new PatPatBot(new Gpt(ENV_OPENAI_API_KEY), new GoogleSearch());
    const repo = new Repository(ENV_REPO_NAME, ENV_DOCS_GLOB);

    repo.docs.slice(0, 10).map((doc, idx, arr) => { // TODO remove slice
        logger.info(`Processing pattern doc ${idx + 1} of ${arr.length}:\n\n${JSON.stringify(doc.data, null, 2)}\n\n`)
        bot.setSourceDocData(doc);
        bot.processSourceDoc().then(() => {
            logger.info(`Improved description:\n\n${bot.getPromptDatum('examine')}\n\n`);
        });
    })
}

run();
