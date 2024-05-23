import {
    API_KEY_OPENAI,
    REPO_NAME,
    DOCS_GLOB,
    DOC_DESCRIPTIONS_PATH,
    DOC_PATTERNS_PATH
} from "./lib/init";
import GoogleSearch from "./lib/GoogleSearch";
import Gpt from "./lib/Gpt";
import PatPatBot from "./lib/PatPatBot";
import Repository from "./lib/Repository";
import logger from "./lib/logging";

async function run() {
    const bot = new PatPatBot(
        new Gpt(API_KEY_OPENAI),
        new GoogleSearch()
    );

    const repo = new Repository(
        REPO_NAME,
        DOCS_GLOB,
        DOC_DESCRIPTIONS_PATH,
        DOC_PATTERNS_PATH,
    );

    const maxIdx = Math.min(repo.docs.length, 3); // TODO remove this
    for (let idx = 0; idx < maxIdx; idx++) {
        const doc = repo.docs[idx];
        logger.info(`Processing pattern ${idx + 1} of ${repo.docs.length}: %o`, doc.data.patternId);
        const output = await bot.processPatternDoc(doc);
        repo.updateDoc(doc, output);
        repo.updateDescriptionsAndPatterns(doc, output);
    }

    repo.saveDescriptionsAndPatterns();
}

run();
